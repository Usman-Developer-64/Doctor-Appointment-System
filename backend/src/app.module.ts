import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { PaymentsModule } from './payments/payments.module';
import { TelemedicineModule } from './telemedicine/telemedicine.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ChatbotModule } from './chatbot/chatbot.module';

@Module({
  imports: [
    // Global config module — loads .env variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // MongoDB connection using async factory
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    AppointmentsModule,
    PaymentsModule,
    TelemedicineModule,
    ReviewsModule,
    ChatbotModule,
  ],
})
export class AppModule {}
