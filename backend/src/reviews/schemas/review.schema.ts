import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Appointment } from '../../appointments/schemas/appointment.schema';

export type ReviewDocument = HydratedDocument<Review>;

@Schema({ timestamps: true })
export class Review {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  patient: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  doctor: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true })
  appointment: Appointment;

  @Prop({ type: Number, required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ type: String, required: true, trim: true })
  comment: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

// Compound index to query doctor reviews quickly
ReviewSchema.index({ doctor: 1 });
