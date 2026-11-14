import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../auth/roles.enum';

export class RegisterDto {
  @IsEmail()
  readonly email!: string;

  @IsString()
  @IsNotEmpty()
  readonly password!: string;

  @IsEnum(UserRole)
  @IsOptional()
  readonly role?: UserRole;
}
