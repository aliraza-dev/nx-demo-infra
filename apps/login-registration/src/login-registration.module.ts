import { Module } from '@nestjs/common';
import { LoginRegistrationController } from './login-registration.controller';
import { LoginRegistrationService } from './login-registration.service';

@Module({
  imports: [],
  controllers: [LoginRegistrationController],
  providers: [LoginRegistrationService],
})
export class LoginRegistrationModule {}
