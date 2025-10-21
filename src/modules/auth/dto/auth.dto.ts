import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { AdminUserRole } from 'src/shared/enums';

class BaseDto {
  @ApiProperty({
    description: 'Email of admin user',
    example: 'admin@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Password of admin user',
    example: 'StrongP@ssw0rd!',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}

export class AdminSignupDto extends BaseDto {
  @ApiProperty({
    description: 'Role of admin user',
    example: AdminUserRole.ADMIN,
  })
  @IsEnum(AdminUserRole)
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string' && value) {
      return value;
    }
    return AdminUserRole.ADMIN;
  })
  role: AdminUserRole;
}

export class AdminLoginDto extends BaseDto {}

export class AuthResponseDto {
  @ApiProperty({
    description: 'Email of admin user',
    example: 'admin@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'JWT Access token',
    example: 'jwt token',
  })
  @IsString()
  accessToken: string;
}
