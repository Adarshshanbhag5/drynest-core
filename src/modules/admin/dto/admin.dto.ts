import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AddAllowedAdminDto {
  @ApiProperty({
    description: 'The email of the allowed admin',
    example: 'admin@example.com',
  })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class AddAllowedAdminResponseDto {
  @ApiProperty({
    description: 'The message of the response',
    example: 'Email added to allowed admins successfully',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}

export class DeleteAllowedAdminDto extends AddAllowedAdminDto {}
export class DeleteAllowedAdminResponseDto {
  @ApiProperty({
    description: 'The message of the response',
    example: 'Allowed admin deleted successfully',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
