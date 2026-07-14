import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment, AppointmentDocument, AppointmentStatus } from './schemas/appointment.schema';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';
import { User, UserDocument } from '../users/schemas/user.schema';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<AppointmentDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  /**
   * Helper: Convert "HH:MM" 24h string to minutes
   */
  private timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Helper: Convert minutes to "HH:MM" 24h string
   */
  private minutesToTime(mins: number): string {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  /**
   * Generate available slots based on doctor's schedule and existing bookings
   */
  async getAvailableSlots(
    doctorId: string,
    dateStr: string,
  ): Promise<string[]> {
    const doctor = await this.userModel.findById(doctorId).exec();
    if (!doctor || doctor.role !== UserRole.DOCTOR || doctor.isBlocked) {
      throw new NotFoundException('Doctor not found or inactive');
    }

    // Determine the day of the week for the selected date
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const dayName = days[dateObj.getUTCDay()];

    // Find schedule configuration for that day
    const daySchedule = doctor.schedule?.find(
      (s) => s.day.toLowerCase() === dayName.toLowerCase(),
    );

    if (!daySchedule || !daySchedule.isWorking) {
      return []; // Return empty if doctor doesn't work on this day
    }

    // Generate potential slots
    const slots: string[] = [];
    let currentMin = this.timeToMinutes(daySchedule.startTime);
    const endMin = this.timeToMinutes(daySchedule.endTime);
    const duration = daySchedule.slotDuration;

    while (currentMin + duration <= endMin) {
      slots.push(this.minutesToTime(currentMin));
      currentMin += duration;
    }

    // Fetch existing booked/confirmed appointments
    const startOfDay = new Date(dateStr);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const bookedAppointments = await this.appointmentModel
      .find({
        doctor: doctorId,
        date: startOfDay,
        status: {
          $in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
        },
      })
      .exec();

    const bookedSlots = bookedAppointments.map((app) => app.slot);

    // Return slots that are not already booked
    return slots.filter((slot) => !bookedSlots.includes(slot));
  }

  /**
   * Book a new appointment
   */
  async bookAppointment(
    patientId: string,
    createDto: CreateAppointmentDto,
  ): Promise<AppointmentDocument> {
    const doctor = await this.userModel.findById(createDto.doctorId).exec();
    if (!doctor || doctor.role !== UserRole.DOCTOR || doctor.isBlocked) {
      throw new NotFoundException('Doctor not found or inactive');
    }

    // Validate that slot is available
    const availableSlots = await this.getAvailableSlots(
      createDto.doctorId,
      createDto.date,
    );

    if (!availableSlots.includes(createDto.slot)) {
      throw new BadRequestException(
        'The selected slot is already booked or unavailable.',
      );
    }

    const startOfDay = new Date(createDto.date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const appointment = new this.appointmentModel({
      patient: patientId,
      doctor: createDto.doctorId,
      date: startOfDay,
      slot: createDto.slot,
      symptoms: createDto.symptoms || null,
      status: AppointmentStatus.PENDING,
    });

    return appointment.save();
  }

  /**
   * Retrieve appointments for current logged-in user
   */
  async getMyAppointments(
    userId: string,
    role: UserRole,
  ): Promise<AppointmentDocument[]> {
    if (role === UserRole.PATIENT) {
      return this.appointmentModel
        .find({ patient: userId })
        .populate('doctor', 'firstName lastName specialization clinicAddress city consultationFee')
        .sort({ date: 1, slot: 1 })
        .exec();
    } else if (role === UserRole.DOCTOR) {
      return this.appointmentModel
        .find({ doctor: userId })
        .populate('patient', 'firstName lastName phone gender age bloodGroup medicalHistory')
        .sort({ date: 1, slot: 1 })
        .exec();
    }
    return [];
  }

  /**
   * Update status of an appointment
   */
  async updateStatus(
    userId: string,
    role: UserRole,
    appointmentId: string,
    statusDto: UpdateAppointmentStatusDto,
  ): Promise<AppointmentDocument> {
    const appointment = await this.appointmentModel.findById(appointmentId).exec();
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    const { status, notes } = statusDto;

    // Check authorization for status transitions
    if (status === AppointmentStatus.CANCELLED) {
      // Both patient and doctor can cancel
      const isPatient = appointment.patient.toString() === userId && role === UserRole.PATIENT;
      const isDoctor = appointment.doctor.toString() === userId && role === UserRole.DOCTOR;
      
      if (!isPatient && !isDoctor) {
        throw new ForbiddenException('You are not authorized to cancel this appointment');
      }
    } else {
      // Confirmed, Completed, and Reject transitions can only be triggered by the Doctor
      const isAssignedDoctor = appointment.doctor.toString() === userId && role === UserRole.DOCTOR;
      if (!isAssignedDoctor) {
        throw new ForbiddenException('Only the assigned doctor can update this status');
      }
    }

    appointment.status = status;
    if (notes) {
      appointment.notes = notes;
    }

    return appointment.save();
  }

  /**
   * Get platform metrics/stats for admin dashboard
   */
  async getAdminStats(): Promise<{
    totalUsers: number;
    totalPatients: number;
    totalDoctors: number;
    totalBookings: number;
    pendingVerifications: number;
  }> {
    const totalUsers = await this.userModel.countDocuments().exec();
    const totalPatients = await this.userModel
      .countDocuments({ role: UserRole.PATIENT })
      .exec();
    const totalDoctors = await this.userModel
      .countDocuments({ role: UserRole.DOCTOR })
      .exec();
    const pendingVerifications = await this.userModel
      .countDocuments({ role: UserRole.DOCTOR, isVerified: false })
      .exec();
    const totalBookings = await this.appointmentModel
      .countDocuments()
      .exec();

    return {
      totalUsers,
      totalPatients,
      totalDoctors,
      totalBookings,
      pendingVerifications,
    };
  }
}
