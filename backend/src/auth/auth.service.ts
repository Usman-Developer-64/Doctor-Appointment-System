import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../common/enums/user-role.enum';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Register a new user
   */
  async register(registerDto: RegisterDto) {
    const { email, password, role, ...rest } = registerDto;

    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    // Prevent registration as admin
    if (role === UserRole.ADMIN) {
      throw new BadRequestException('Cannot register as admin');
    }

    // Hash the password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the user
    const user = await this.usersService.create({
      ...rest,
      email,
      password: hashedPassword,
      role: role || UserRole.PATIENT,
      isVerified: role === UserRole.DOCTOR ? false : true,
    });

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  /**
   * Login with email and password
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user with password field
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if user is blocked
    if (user.isBlocked) {
      throw new UnauthorizedException(
        'Your account has been blocked. Please contact support.',
      );
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  /**
   * Get current user profile
   */
  async getMe(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.sanitizeUser(user);
  }

  /**
   * Forgot password — generates reset token
   */
  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);

    // Always return success to prevent email enumeration
    if (!user) {
      return {
        message:
          'If an account with this email exists, a reset link has been sent.',
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set reset token (expires in 1 hour)
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    await this.usersService.setResetToken(
      (user as any)._id.toString(),
      hashedToken,
      expires,
    );

    // In Phase 2, send email with reset link
    // For now, return the token (remove in production)
    return {
      message:
        'If an account with this email exists, a reset link has been sent.',
      // TODO: Remove this in production — only for testing
      resetToken,
    };
  }

  /**
   * Change password for logged-in user
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.usersService.findByEmail(
      (await this.usersService.findById(userId))?.email || '',
    );

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Validate current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await this.usersService.updatePassword(userId, hashedPassword);

    return { message: 'Password changed successfully' };
  }

  /**
   * Generate JWT token
   */
  private generateToken(user: any): string {
    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    return this.jwtService.sign(payload);
  }

  /**
   * Remove sensitive fields from user object
   */
  private sanitizeUser(user: any) {
    const obj = user.toObject ? user.toObject() : { ...user };
    delete obj.password;
    delete obj.resetPasswordToken;
    delete obj.resetPasswordExpires;
    delete obj.__v;
    return obj;
  }
}
