import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Query,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  /**
   * Get available time slots for a doctor on a specific date (Public)
   */
  @Get('slots')
  async getAvailableSlots(
    @Query('doctorId') doctorId: string,
    @Query('date') date: string,
  ) {
    const slots = await this.appointmentsService.getAvailableSlots(doctorId, date);
    return {
      success: true,
      data: slots,
    };
  }

  /**
   * Book an appointment (Patients only)
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PATIENT)
  async bookAppointment(
    @Req() req: any,
    @Body() createDto: CreateAppointmentDto,
  ) {
    const appointment = await this.appointmentsService.bookAppointment(
      req.user.sub,
      createDto,
    );
    return {
      success: true,
      message: 'Appointment request submitted successfully',
      data: appointment,
    };
  }

  /**
   * Get all appointments for current patient or doctor
   */
  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyAppointments(@Req() req: any) {
    const appointments = await this.appointmentsService.getMyAppointments(
      req.user.sub,
      req.user.role as UserRole,
    );
    return {
      success: true,
      data: appointments,
    };
  }

  /**
   * Update status of an appointment
   */
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() statusDto: UpdateAppointmentStatusDto,
  ) {
    const appointment = await this.appointmentsService.updateStatus(
      req.user.sub,
      req.user.role as UserRole,
      id,
      statusDto,
    );
    return {
      success: true,
      message: `Appointment status updated to ${statusDto.status}`,
      data: appointment,
    };
  }

  /**
   * Get platform metrics (Admin only)
   */
  @Get('admin/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAdminStats() {
    const stats = await this.appointmentsService.getAdminStats();
    return {
      success: true,
      data: stats,
    };
  }
}
