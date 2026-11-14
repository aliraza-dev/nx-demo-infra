import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import {
  JWT_SECRET,
  JwtStrategy,
  RolesGuard,
} from './auth';
import { DatabaseService } from './database.service';
import { LocalStrategy } from './local.strategy';
import { LoginRegistrationController } from './login-registration.controller';
import { LoginRegistrationService } from './login-registration.service';
import { UsersService } from './users.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [LoginRegistrationController],
  providers: [
    DatabaseService,
    UsersService,
    LocalStrategy,
    JwtStrategy,
    RolesGuard,
    LoginRegistrationService,
  ],
  exports: [
    LoginRegistrationService,
    UsersService,
    DatabaseService,
    JwtModule,
    PassportModule,
  ],
})
export class LoginRegistrationModule {}
