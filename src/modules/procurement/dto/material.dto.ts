import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { MaterialUnit } from '../procurement.enums';

export class MaterialDto {
  @ApiProperty({ description: 'Unique material code', example: 'APPLE-001' })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Material name', example: 'Apple' })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Unit of measurement',
    example: MaterialUnit.KG,
    enum: MaterialUnit,
    required: false,
  })
  @IsEnum(MaterialUnit)
  @IsOptional()
  unit?: MaterialUnit;

  @ApiProperty({ description: 'HSN code', required: false })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  hsnCode?: string;

  @ApiProperty({ description: 'Tax rate in percent', example: 18 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  taxRate?: number;

  @ApiProperty({
    description: 'Is active flag',
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class DeleteMaterialResponseDto {
  @ApiProperty({ description: 'Success flag', example: true })
  success: boolean;

  @ApiProperty({
    description: 'Message',
    example: 'Material deleted successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Material ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;
}
