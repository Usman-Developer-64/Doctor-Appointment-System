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
    const cleanEmail = email ? email.trim().toLowerCase() : '';

    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    const isTargetAdmin = cleanEmail === 'us8187934@gmail.com';

    // Prevent registration as admin (except for the target admin email)
    if (role === UserRole.ADMIN && !isTargetAdmin) {
      throw new BadRequestException('Cannot register as admin');
    }

    // Hash the password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const finalRole = isTargetAdmin ? UserRole.ADMIN : (role || UserRole.PATIENT);
    const isVerified = isTargetAdmin ? true : (role === UserRole.DOCTOR ? false : true);

    // Create the user
    const user = await this.usersService.create({
      ...rest,
      email,
      password: hashedPassword,
      role: finalRole,
      isVerified,
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

    console.log(`[AuthService] Login attempt for: ${email}`);

    // Find user with password field
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      console.log(`[AuthService] Login failed: User not found for email ${email}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    const cleanEmail = email ? email.trim().toLowerCase() : '';
    if (cleanEmail === 'us8187934@gmail.com' && user.role !== UserRole.ADMIN) {
      console.log(`[AuthService] Dynamically promoting ${cleanEmail} to Admin in database...`);
      user.role = UserRole.ADMIN;
      user.isVerified = true;
      await user.save();
    }

    console.log(`[AuthService] User found. Stored password hash present: ${!!user.password}`);

    // Check if user is blocked
    if (user.isBlocked) {
      console.log(`[AuthService] Login failed: User is blocked`);
      throw new UnauthorizedException(
        'Your account has been blocked. Please contact support.',
      );
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(`[AuthService] Password validation result: ${isPasswordValid}`);
    
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
   * Handle Google OAuth user registration/login sync
   */
  async googleLogin(googleUser: any) {
    if (!googleUser) {
      throw new BadRequestException('No user information received from Google');
    }

    const { email, firstName, lastName, avatar } = googleUser;

    // Check if user already exists
    let user = await this.usersService.findByEmail(email);

    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const isTargetAdmin = cleanEmail === 'us8187934@gmail.com';

    if (!user) {
      // If user does not exist, auto-signup as patient (or admin if target email)
      const salt = await bcrypt.genSalt(12);
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = await this.usersService.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: isTargetAdmin ? UserRole.ADMIN : UserRole.PATIENT,
        avatar,
        isVerified: true,
        isBlocked: false,
      });
    } else {
      // Force admin role if existing user's role is not admin
      if (isTargetAdmin && user.role !== UserRole.ADMIN) {
        user.role = UserRole.ADMIN;
        user.isVerified = true;
      }
      // Sync avatar if empty
      if (!user.avatar && avatar) {
        user.avatar = avatar;
      }
      await user.save();
    }

    // Check if user is blocked
    if (user.isBlocked) {
      throw new UnauthorizedException(
        'Your account has been blocked. Please contact support.',
      );
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
