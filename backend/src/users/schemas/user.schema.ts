import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserRole } from '../../common/enums/user-role.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({
    type: String,
    enum: UserRole,
    default: UserRole.PATIENT,
  })
  role: UserRole;

  @Prop({ default: null })
  avatar: string;

  @Prop({ default: null })
  phone: string;

  @Prop({ default: false })
  isBlocked: boolean;

  @Prop({ default: false })
  isVerified: boolean;

  // ─── Patient-specific fields ───
  @Prop({ default: null })
  age: number;

  @Prop({ default: null })
  bloodGroup: string;

  @Prop({ default: null })
  medicalHistory: string;

  @Prop({ default: null })
  gender: string;

  @Prop({
    type: {
      name: { type: String, default: null },
      phone: { type: String, default: null },
      relation: { type: String, default: null },
    },
    default: null,
    _id: false,
  })
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };

  // ─── Doctor-specific fields ───
  @Prop({ default: null })
  specialization: string;

  @Prop({ default: null })
  experience: number;

  @Prop({ default: null })
  clinicAddress: string;

  @Prop({ default: null })
  consultationFee: number;

  @Prop({ default: null })
  education: string;

  @Prop({ default: null })
  city: string;

  @Prop({ default: null })
  bio: string;

  @Prop({
    type: [
      {
        day: { type: String, required: true },
        isWorking: { type: Boolean, default: false },
        startTime: { type: String, default: '09:00' },
        endTime: { type: String, default: '17:00' },
        slotDuration: { type: Number, default: 30 },
      },
    ],
    default: [],
  })
  schedule: Array<{
    day: string;
    isWorking: boolean;
    startTime: string;
    endTime: string;
    slotDuration: number;
  }>;

  // ─── Password Reset ───
  @Prop({ default: null })
  resetPasswordToken: string;

  @Prop({ default: null })
  resetPasswordExpires: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Index for common queries
UserSchema.index({ role: 1 });
UserSchema.index({ specialization: 1, city: 1 });
UserSchema.index({ email: 1 }, { unique: true });
