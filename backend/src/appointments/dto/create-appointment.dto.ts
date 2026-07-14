import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAppointmentDto {
  @IsNotEmpty()
  @IsString()
  doctorId: string;

  @IsNotEmpty()
  @IsString()
  date: string; // Format: "YYYY-MM-DD"

  @IsNotEmpty()
  @IsString()
  slot: string; // e.g. "10:30" or "10:30 AM"

  @IsOptional()
  @IsString()
  symptoms?: string;
}
