import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type TelemedicineMessageDocument = HydratedDocument<TelemedicineMessage>;

@Schema({ timestamps: true })
export class TelemedicineMessage {
  @Prop({ required: true })
  roomId: string;

  @Prop({ required: true })
  senderName: string;

  @Prop({ required: true })
  text: string;

  @Prop({ default: null })
  attachmentType: string;

  @Prop({ default: null })
  attachmentUrl: string;

  @Prop({ default: null })
  fileName: string;
}

export const TelemedicineMessageSchema = SchemaFactory.createForClass(TelemedicineMessage);

// Index to query room logs efficiently
TelemedicineMessageSchema.index({ roomId: 1 });
