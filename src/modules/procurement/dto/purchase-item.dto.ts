import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class PurchaseItemDto {
  @ApiProperty({ description: 'Purchase id' })
  @IsString()
  @IsNotEmpty()
  purchaseId: string;

  @ApiProperty({ description: 'Material id' })
  @IsString()
  @IsNotEmpty()
  materialId: string;

  @ApiProperty({ description: 'Quantity ordered', example: 10.5 })
  @IsNumber({ maxDecimalPlaces: 3 })
  qty: number;

  @ApiProperty({ description: 'Unit price', example: 100.25 })
  @IsNumber({ maxDecimalPlaces: 2 })
  unitPrice: number;

  @ApiProperty({
    description: 'Tax rate in percent',
    example: 18,
    required: false,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  taxRate?: number;
}

export class CreatePurchaseItemForPurchaseDto extends OmitType(
  PurchaseItemDto,
  ['purchaseId'],
) {}

export class DeletePurchaseItemResponseDto {
  @ApiProperty({ description: 'Success flag', example: true })
  success: boolean;

  @ApiProperty({
    description: 'Message',
    example: 'Purchase item deleted successfully',
  })
  message: string;

  @ApiProperty({ description: 'Purchase item ID' })
  id: string;
}
