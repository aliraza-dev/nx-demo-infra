import { Injectable, Logger } from '@nestjs/common';
import { LoginDto } from './dto';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  healthz(): { message: string } {
    return { message: 'Health check passed in Api Gateway' };
  }

  login(loginDto: LoginDto): { message: string } {
    this.logger.log(`Login attempt for email: ${loginDto.email}`);
    return { message: 'Login successful' };
  }
}
