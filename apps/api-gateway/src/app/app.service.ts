import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  healthz(): { message: string } {
    return { message: 'Health check passed in Api Gateway' };
  }
}
