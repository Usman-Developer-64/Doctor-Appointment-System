import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { Appointment, AppointmentDocument, AppointmentStatus } from '../appointments/schemas/appointment.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private readonly reviewModel: Model<ReviewDocument>,
    @InjectModel(Appointment.name) private readonly appointmentModel: Model<AppointmentDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  /**
   * Submit a review for a completed appointment
   */
  async createReview(
    patientId: string,
    appointmentId: string,
    rating: number,
    comment: string,
  ): Promise<ReviewDocument> {
    const appointment = await this.appointmentModel.findById(appointmentId).exec();
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Verify appointment status is completed and matches patientId
    if (appointment.patient.toString() !== patientId) {
      throw new BadRequestException('You are not authorized to review this appointment');
    }

    if (appointment.status !== AppointmentStatus.COMPLETED) {
      throw new BadRequestException('You can only review completed appointments');
    }

    // Check if review already exists for this appointment
    const existingReview = await this.reviewModel.findOne({ appointment: appointmentId }).exec();
    if (existingReview) {
      throw new BadRequestException('You have already submitted a review for this appointment');
    }

    const review = new this.reviewModel({
      patient: patientId,
      doctor: appointment.doctor,
      appointment: appointmentId,
      rating,
      comment,
    });

    return review.save();
  }

  /**
   * Get reviews for a specific doctor
   */
  async getDoctorReviews(doctorId: string): Promise<ReviewDocument[]> {
    return this.reviewModel
      .find({ doctor: doctorId })
      .populate('patient', 'firstName lastName')
      .sort({ createdAt: -1 })
      .exec();
  }
}
