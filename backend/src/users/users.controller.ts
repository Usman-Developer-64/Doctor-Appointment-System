import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  Req,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Req() req: any) {
    const user = await this.usersService.findById(req.user.sub);
    return {
      success: true,
      data: user,
    };
  }

  @Patch('profile')
  async updateProfile(
    @Req() req: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const user = await this.usersService.updateProfile(
      req.user.sub,
      updateProfileDto,
    );
    return {
      success: true,
      message: 'Profile updated successfully',
      data: user,
    };
  }

  /**
   * List all users (Admin only)
   */
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getUsers(
    @Query('role') role?: string,
    @Query('isBlocked') isBlocked?: string,
  ) {
    const filters: any = {};
    if (role) filters.role = role;
    if (isBlocked !== undefined) {
      filters.isBlocked = isBlocked === 'true';
    }
    const users = await this.usersService.findAll(filters);
    return {
      success: true,
      data: users,
    };
  }

  /**
   * Block/Unblock user (Admin only)
   */
  @Patch(':id/block')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async toggleBlock(@Param('id') id: string) {
    const user = await this.usersService.toggleBlock(id);
    return {
      success: true,
      message: `User block status toggled to ${user.isBlocked}`,
      data: user,
    };
  }

  /**
   * Verify doctor credentials (Admin only)
   */
  @Patch(':id/verify')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async verifyDoctor(@Param('id') id: string) {
    const user = await this.usersService.verifyDoctor(id);
    return {
      success: true,
      message: 'Doctor verified successfully',
      data: user,
    };
  }

  /**
   * Change user role (Admin only)
   */
  @Patch(':id/role')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async changeRole(
    @Req() req: any,
    @Param('id') id: string,
    @Body('role') role: string,
  ) {
    // Prevent admin from changing their own role
    if (req.user.sub === id) {
      throw new BadRequestException('You cannot change your own role');
    }

    // Validate role
    if (!Object.values(UserRole).includes(role as UserRole)) {
      throw new BadRequestException(
        `Invalid role. Must be one of: ${Object.values(UserRole).join(', ')}`,
      );
    }

    const user = await this.usersService.changeRole(id, role as UserRole);
    return {
      success: true,
      message: `User role changed to ${role}`,
      data: user,
    };
  }

  /**
   * Delete user permanently (Admin only)
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteUser(@Req() req: any, @Param('id') id: string) {
    // Prevent admin from deleting themselves
    if (req.user.sub === id) {
      throw new BadRequestException('You cannot delete your own account');
    }

    await this.usersService.deleteUser(id);
    return {
      success: true,
      message: 'User deleted successfully',
    };
  }
}
