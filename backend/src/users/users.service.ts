import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  /**
   * Find a user by email (includes password for auth)
   */
  async findByEmail(email: string): Promise<UserDocument | null> {
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    return this.userModel.findOne({ email: cleanEmail }).select('+password').exec();
  }

  /**
   * Find a user by ID (excludes password)
   */
  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  /**
   * Create a new user
   */
  async create(userData: Partial<User>): Promise<UserDocument> {
    const user = new this.userModel(userData);
    return user.save();
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updateData: UpdateProfileDto,
  ): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(userId, { $set: updateData }, { new: true })
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /**
   * Update user's password (pre-hashed)
   */
  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, { password: hashedPassword })
      .exec();
  }

  /**
   * Find user by reset token
   */
  async findByResetToken(token: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() },
      })
      .exec();
  }

  /**
   * Set reset password token
   */
  async setResetToken(
    userId: string,
    token: string,
    expires: Date,
  ): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, {
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      })
      .exec();
  }

  /**
   * Clear reset token after password is changed
   */
  async clearResetToken(userId: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, {
        resetPasswordToken: null,
        resetPasswordExpires: null,
      })
      .exec();
  }

  /**
   * Get all users (admin)
   */
  async findAll(filters?: {
    role?: string;
    isBlocked?: boolean;
  }): Promise<UserDocument[]> {
    const query: Record<string, unknown> = {};
    if (filters?.role) query.role = filters.role;
    if (filters?.isBlocked !== undefined) query.isBlocked = filters.isBlocked;
    return this.userModel.find(query).exec();
  }

  /**
   * Block/Unblock user (admin)
   */
  async toggleBlock(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.isBlocked = !user.isBlocked;
    return user.save();
  }

  /**
   * Verify doctor (admin)
   */
  async verifyDoctor(userId: string): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(userId, { isVerified: true }, { new: true })
      .exec();
    if (!user) {
      throw new NotFoundException('Doctor not found');
    }
    return user;
  }

  /**
   * Find verified and active doctors with filters for discovery
   */
  async findDoctors(filters: {
    specialization?: string;
    city?: string;
    maxFee?: number;
    minExperience?: number;
    search?: string;
    day?: string;
  }): Promise<UserDocument[]> {
    const query: Record<string, any> = {
      role: UserRole.DOCTOR,
      isBlocked: false,
    };

    if (filters.specialization) {
      query.specialization = { $regex: new RegExp(filters.specialization, 'i') };
    }

    if (filters.city) {
      query.city = { $regex: new RegExp(filters.city, 'i') };
    }

    if (filters.maxFee !== undefined && !isNaN(filters.maxFee)) {
      query.consultationFee = { $lte: filters.maxFee };
    }

    if (filters.minExperience !== undefined && !isNaN(filters.minExperience)) {
      query.experience = { $gte: filters.minExperience };
    }

    if (filters.search) {
      query.$or = [
        { firstName: { $regex: new RegExp(filters.search, 'i') } },
        { lastName: { $regex: new RegExp(filters.search, 'i') } },
        { clinicAddress: { $regex: new RegExp(filters.search, 'i') } },
      ];
    }

    if (filters.day) {
      query.schedule = {
        $elemMatch: {
          day: { $regex: new RegExp(filters.day, 'i') },
          isWorking: true,
        },
      };
    }

    return this.userModel.find(query).exec();
  }

  /**
   * Change user role (admin only)
   */
  async changeRole(userId: string, newRole: UserRole): Promise<UserDocument> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.role = newRole;
    // Auto-verify if promoted to admin
    if (newRole === UserRole.ADMIN) {
      user.isVerified = true;
    }
    return user.save();
  }

  /**
   * Delete user permanently (admin only)
   */
  async deleteUser(userId: string): Promise<void> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userModel.findByIdAndDelete(userId).exec();
  }
}
