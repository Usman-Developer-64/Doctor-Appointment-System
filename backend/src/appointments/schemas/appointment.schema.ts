import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type AppointmentDocument = HydratedDocument<Appointment>;

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Schema({ timestamps: true })
export class Appointment {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  patient: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  doctor: User;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ type: String, required: true })
  slot: string; // e.g. "10:00 AM"

  @Prop({
    type: String,
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  @Prop({ type: String, default: null })
  symptoms: string;

  @Prop({ type: String, default: null })
  notes: string; // Doctor's treatment notes / feedback
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);

// Create compound index to search quickly by doctor & date
AppointmentSchema.index({ doctor: 1, date: 1 });
AppointmentSchema.index({ patient: 1 });
