import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TelemedicineGateway } from './telemedicine.gateway';
import { TelemedicineMessage, TelemedicineMessageSchema } from './schemas/message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TelemedicineMessage.name, schema: TelemedicineMessageSchema },
    ]),
  ],
  providers: [TelemedicineGateway],
  exports: [TelemedicineGateway],
})
export class TelemedicineModule {}
