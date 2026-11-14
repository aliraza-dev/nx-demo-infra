import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from './auth/roles.enum';
import { UsersService } from './users.service';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginResult {
  success: boolean;
  message: string;
  userId: string;
  email: string;
  token: string;
  role: string;
}

export interface RegisterResult {
  success: boolean;
  message: string;
  userId: string;
  email: string;
  role: string;
}

@Injectable()
export class LoginRegistrationService {
  private readonly logger = new Logger(LoginRegistrationService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResult> {
    this.logger.log(`Processing login for email: ${loginDto.email}`);

    const user = await this.usersService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    if (!user) {
      this.logger.warn(`Failed login attempt for email: ${loginDto.email}`);
      return {
        success: false,
        message: 'Invalid email or password',
        userId: '',
        email: loginDto.email,
        token: '',
        role: '',
      };
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    this.logger.log(
      `User authenticated successfully: ${user.email} (Role: ${user.role}, ID: ${user.id})`,
    );

    return {
      success: true,
      message: 'Login successful',
      userId: String(user.id),
      email: user.email,
      token,
      role: user.role,
    };
  }

  async register(registerDto: RegisterDto): Promise<RegisterResult> {
    this.logger.log(`Processing registration for email: ${registerDto.email}`);

    const existing = await this.usersService.findByEmail(registerDto.email);
    if (existing) {
      this.logger.warn(
        `Registration rejected, email already exists: ${registerDto.email}`,
      );
      return {
        success: false,
        message: 'User already exists with this email',
        userId: '',
        email: registerDto.email,
        role: '',
      };
    }

    const assignedRole =
      registerDto.role && Object.values(UserRole).includes(registerDto.role)
        ? registerDto.role
        : UserRole.DEVELOPER;

    const newUser = await this.usersService.create(
      registerDto.email,
      registerDto.password,
      assignedRole,
    );

    return {
      success: true,
      message: 'User registered successfully',
      userId: String(newUser.id),
      email: newUser.email,
      role: newUser.role,
    };
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return {
        valid: true,
        userId: String(payload.sub),
        email: payload.email,
        role: payload.role,
      };
    } catch {
      return {
        valid: false,
        userId: '',
        email: '',
        role: '',
      };
    }
  }

  getHello(): string {
    return 'Login & Registration Service operational';
  }
}
