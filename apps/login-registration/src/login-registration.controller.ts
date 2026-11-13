import { Controller, Get } from '@nestjs/common';
import { LoginRegistrationService } from './login-registration.service';

@Controller()
export class LoginRegistrationController {
  constructor(private readonly loginRegistrationService: LoginRegistrationService) {}

  @Get()
  getHello(): string {
    return this.loginRegistrationService.getHello();
  }
}
