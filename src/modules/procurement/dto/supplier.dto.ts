import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class SupplierAddressDto {
  @ApiProperty({ description: 'Supplier address line 1', example: '8th cross' })
  @IsString()
  @IsNotEmpty()
  line1: string;

  @ApiProperty({
    description: 'Supplier address line 2',
    required: false,
    example: 'abc layout',
  })
  @IsString()
  @IsOptional()
  line2?: string;

  @ApiProperty({ description: 'Supplier city', example: 'Bangalore' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'Supplier state', example: 'Karnataka' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ description: 'Supplier postal code', example: '560001' })
  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @ApiProperty({ description: 'Supplier country', example: 'India' })
  @IsString()
  @IsNotEmpty()
  country: string;
}

export class SupplierDto {
  @ApiProperty({ description: 'Supplier name', example: 'ABC Pvt Ltd' })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty({ message: 'Supplier name is required' })
  name: string;

  @ApiProperty({ description: 'Supplier phone', example: '+91 9876543210' })
  @IsPhoneNumber('IN', { message: 'Invalid phone number' })
  @IsNotEmpty({ message: 'Phone number is required' })
  phone: string;

  @ApiProperty({
    description: 'Supplier email',
    required: false,
    example: 'abc@example.com',
  })
  @IsString()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Supplier address', type: SupplierAddressDto })
  @ValidateNested()
  @Type(() => SupplierAddressDto)
  address: SupplierAddressDto;

  @ApiProperty({ description: 'GSTIN', required: false, example: '1234567890' })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  gstin?: string;

  @ApiProperty({
    description: 'Is active flag',
    example: true,
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive: boolean = true;
}

export class DeleteSupplierResponseDto {
  @ApiProperty({ description: 'Success flag', example: true })
  success: boolean;

  @ApiProperty({
    description: 'Message',
    example: 'Supplier deleted successfully',
  })
  message: string;

  @ApiProperty({ description: 'Supplier ID' })
  id: string;
}
