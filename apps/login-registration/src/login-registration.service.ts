import { Injectable } from '@nestjs/common';

@Injectable()
export class LoginRegistrationService {
  getHello(): string {
    return 'Hello World!';
  }
}
