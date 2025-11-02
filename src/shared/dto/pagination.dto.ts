import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { SortOrder } from '../enums';

export class PaginationDto {
  @ApiProperty({
    description: 'Page size (number of items per page)',
    type: 'number',
    required: true,
  })
  @IsNumber()
  @Min(1)
  pageSize: number;

  @ApiProperty({
    description: 'Page number (starts from 0)',
    type: 'number',
    required: true,
  })
  @IsNumber()
  @Min(0)
  pageNumber: number;
}

export class FindAllDto extends PaginationDto {
  @ApiProperty({
    description: 'Search query',
    required: false,
    example: 'Apple',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  searchQuery?: string;

  @ApiProperty({
    description: 'Sort by',
    required: false,
    example: 'name',
  })
  @IsOptional()
  @IsString()
  sortBy: string = 'createdAt';

  @ApiProperty({
    description: 'Sort order',
    required: false,
    example: SortOrder.ASC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder: SortOrder = SortOrder.DESC;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Data',
    type: [Object],
  })
  data: T[];

  @ApiProperty({
    description: 'Total count',
    type: 'number',
  })
  totalCount: number;
}
