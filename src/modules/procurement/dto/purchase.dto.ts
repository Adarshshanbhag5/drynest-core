import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PurchaseStatus } from '../procurement.enums';
import { CreatePurchaseItemForPurchaseDto } from './purchase-item.dto';

export class PurchaseDto {
  @ApiProperty({ description: 'Unique purchase number' })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  purchaseNo: string;

  @ApiProperty({ description: 'Supplier id' })
  @IsString()
  @IsNotEmpty()
  supplierId: string;

  @ApiProperty({
    enum: PurchaseStatus,
    required: false,
    default: PurchaseStatus.DRAFT,
  })
  @IsEnum(PurchaseStatus)
  @IsOptional()
  status?: PurchaseStatus;

  @ApiProperty({ description: 'Ordered at', required: false })
  @IsDateString()
  @IsOptional()
  orderedAt?: Date | string;

  @ApiProperty({ description: 'Optional notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ type: [CreatePurchaseItemForPurchaseDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseItemForPurchaseDto)
  items: CreatePurchaseItemForPurchaseDto[];
}

export class DeletePurchaseResponseDto {
  @ApiProperty({ description: 'Success flag', example: true })
  success: boolean;

  @ApiProperty({
    description: 'Message',
    example: 'Purchase deleted successfully',
  })
  message: string;

  @ApiProperty({ description: 'Purchase ID' })
  id: string;
}
