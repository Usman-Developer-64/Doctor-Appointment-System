import {
  Controller,
  Get,
  Query,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getDoctors(
    @Query('specialization') specialization?: string,
    @Query('city') city?: string,
    @Query('maxFee') maxFee?: number,
    @Query('minExperience') minExperience?: number,
    @Query('search') search?: string,
    @Query('day') day?: string,
  ) {
    const doctors = await this.usersService.findDoctors({
      specialization,
      city,
      maxFee,
      minExperience,
      search,
      day,
    });

    return {
      success: true,
      data: doctors,
    };
  }

  @Get(':id')
  async getDoctorById(@Param('id') id: string) {
    const doctor = await this.usersService.findById(id);

    if (!doctor || doctor.role !== UserRole.DOCTOR || doctor.isBlocked) {
      throw new NotFoundException('Doctor not found');
    }

    return {
      success: true,
      data: doctor,
    };
  }
}
