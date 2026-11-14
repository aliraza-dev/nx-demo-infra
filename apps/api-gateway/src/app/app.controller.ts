import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard, Roles, RolesGuard, UserRole } from './auth';
import { LoginDto, OrderDetailsDto, RegisterDto } from './dto';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  private readonly winstonLogger = new Logger('WinstonLogger');
  constructor(private readonly appService: AppService) {}

  @Get()
  healthz() {
    console.log('Received request to / endpoint');
    this.logger.log('--- Gateway Endpoint Pinged Successfully ---');
    this.winstonLogger.log('--- Gateway Endpoint Pinged Successfully ---');

    return this.appService.healthz();
  }

  // Public Login Endpoint -> routes via gRPC to LoginRegistrationService
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    this.logger.log(`--- Gateway login attempt for email=${loginDto.email} ---`);
    return this.appService.login(loginDto);
  }

  // Public Register Endpoint -> routes via gRPC to LoginRegistrationService
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    this.logger.log(
      `--- Gateway register attempt for email=${registerDto.email} (role=${registerDto.role || 'developer'}) ---`,
    );
    return this.appService.register(registerDto);
  }

  // Protected Profile Endpoint -> requires valid JWT Bearer token
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: any) {
    return {
      message: 'Gateway authenticated profile',
      user: req.user,
    };
  }

  // Admin-Only Protected Endpoint -> requires role 'admin'
  @Get('admin/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getAdminDashboard(@Req() req: any) {
    return {
      message: 'Admin dashboard access granted',
      user: req.user,
    };
  }

  // Maintainer & Admin Protected Endpoint
  @Get('maintainer/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MAINTAINER)
  getMaintainerDashboard(@Req() req: any) {
    return {
      message: 'Maintainer dashboard access granted',
      user: req.user,
    };
  }

  @Post('order-details')
  getOrderDetails(@Body() orderDetailsDto: OrderDetailsDto) {
    this.logger.log(
      `--- Gateway order-details request for orderId=${orderDetailsDto.orderId} ---`,
    );
    return this.appService.getOrderDetails(orderDetailsDto);
  }
}
