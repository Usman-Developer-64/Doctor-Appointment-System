import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  /**
   * Submit a review for a completed appointment (Patient only)
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PATIENT)
  async createReview(
    @Req() req: any,
    @Body('appointmentId') appointmentId: string,
    @Body('rating') rating: number,
    @Body('comment') comment: string,
  ) {
    const review = await this.reviewsService.createReview(
      req.user.sub,
      appointmentId,
      rating,
      comment,
    );
    return {
      success: true,
      message: 'Review submitted successfully',
      data: review,
    };
  }

  /**
   * Get all reviews for a doctor (Public)
   */
  @Get('doctor/:id')
  async getDoctorReviews(@Param('id') id: string) {
    const reviews = await this.reviewsService.getDoctorReviews(id);
    return {
      success: true,
      data: reviews,
    };
  }
}
