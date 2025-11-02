import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PurchaseItemsService } from '../services/purchase-items.service';
import {
  PurchaseItemDto,
  DeletePurchaseItemResponseDto,
} from '../dto/purchase-item.dto';
import {
  FindAllDto,
  PaginatedResponseDto,
} from 'src/shared/dto/pagination.dto';
import { PurchaseItemEntity } from '../entities/purchase-item.entity';

@ApiTags('procurement/purchase-items')
@Controller('procurement/purchase-items')
export class PurchaseItemsController {
  constructor(private readonly purchaseItemsService: PurchaseItemsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new purchase item' })
  @ApiResponse({ status: HttpStatus.CREATED, type: PurchaseItemEntity })
  create(@Body() input: PurchaseItemDto) {
    return this.purchaseItemsService.create(input);
  }

  @Get()
  @ApiOperation({ summary: 'Get all purchase items' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PaginatedResponseDto<PurchaseItemEntity>,
  })
  findAll(@Query() query: FindAllDto) {
    return this.purchaseItemsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a purchase item by ID' })
  @ApiResponse({ status: HttpStatus.OK, type: PurchaseItemEntity })
  findOne(@Param('id') id: string) {
    return this.purchaseItemsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a purchase item by ID' })
  @ApiResponse({ status: HttpStatus.OK, type: PurchaseItemEntity })
  update(@Param('id') id: string, @Body() input: PurchaseItemDto) {
    return this.purchaseItemsService.update(id, input);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a purchase item by ID' })
  @ApiResponse({ status: HttpStatus.OK, type: DeletePurchaseItemResponseDto })
  remove(@Param('id') id: string) {
    return this.purchaseItemsService.remove(id);
  }
}
