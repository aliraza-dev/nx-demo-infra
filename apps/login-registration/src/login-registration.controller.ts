import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  JwtAuthGuard,
  Roles,
  RolesGuard,
  UserRole,
} from './auth';
import {
  LoginDto,
  LoginRegistrationService,
  LoginResult,
  RegisterDto,
  RegisterResult,
} from './login-registration.service';
import { UsersService } from './users.service';

@Controller()
export class LoginRegistrationController {
  private readonly logger = new Logger(LoginRegistrationController.name);

  constructor(
    private readonly loginRegistrationService: LoginRegistrationService,
    private readonly usersService: UsersService,
  ) {}

  @Get('healthz')
  getHello(): string {
    return this.loginRegistrationService.getHello();
  }

  // gRPC Method for Login
  @GrpcMethod('LoginRegistrationService', 'Login')
  async login(data: LoginDto): Promise<LoginResult> {
    this.logger.log(`--- gRPC Login invoked for email=${data.email} ---`);
    return this.loginRegistrationService.login(data);
  }

  // gRPC Method for Registration
  @GrpcMethod('LoginRegistrationService', 'Register')
  async register(data: RegisterDto): Promise<RegisterResult> {
    this.logger.log(`--- gRPC Register invoked for email=${data.email} ---`);
    return this.loginRegistrationService.register(data);
  }

  // gRPC Method for Token Validation
  @GrpcMethod('LoginRegistrationService', 'ValidateToken')
  async validateToken(data: { token: string }) {
    this.logger.log('--- gRPC ValidateToken invoked ---');
    return this.loginRegistrationService.validateToken(data.token);
  }

  // HTTP endpoint for Login
  @Post('login')
  async httpLogin(@Body() loginDto: LoginDto): Promise<LoginResult> {
    this.logger.log(`--- HTTP Login invoked for email=${loginDto.email} ---`);
    return this.loginRegistrationService.login(loginDto);
  }

  // HTTP endpoint for Register
  @Post('register')
  async httpRegister(
    @Body() registerDto: RegisterDto,
  ): Promise<RegisterResult> {
    this.logger.log(
      `--- HTTP Register invoked for email=${registerDto.email} ---`,
    );
    return this.loginRegistrationService.register(registerDto);
  }

  // Protected endpoint (any authenticated user)
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: any) {
    return {
      message: 'Authenticated profile fetched successfully',
      user: req.user,
    };
  }

  // Protected endpoint restricted to ADMIN only
  @Get('admin/users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAdminUsers() {
    this.logger.log('Admin route accessed: listing all users');
    const users = await this.usersService.findAll();
    return {
      message: 'All registered users (Admin access)',
      users,
    };
  }

  // Protected endpoint accessible to MAINTAINER and ADMIN
  @Get('maintainer/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MAINTAINER)
  getMaintainerStatus(@Req() req: any) {
    return {
      message: 'Maintainer & Admin dashboard status',
      user: req.user,
      systemStatus: 'healthy',
    };
  }
}
