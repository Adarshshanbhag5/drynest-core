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
import { PurchasesService } from '../services/purchases.service';
import { PurchaseDto, DeletePurchaseResponseDto } from '../dto/purchase.dto';
import {
  FindAllDto,
  PaginatedResponseDto,
} from 'src/shared/dto/pagination.dto';
import { PurchaseEntity } from '../entities/purchase.entity';

@ApiTags('procurement/purchases')
@Controller('procurement/purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new purchase' })
  @ApiResponse({ status: HttpStatus.CREATED, type: PurchaseEntity })
  create(@Body() input: PurchaseDto) {
    return this.purchasesService.create(input);
  }

  @Get()
  @ApiOperation({ summary: 'Get all purchases' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PaginatedResponseDto<PurchaseEntity>,
  })
  findAll(@Query() query: FindAllDto) {
    return this.purchasesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a purchase by ID' })
  @ApiResponse({ status: HttpStatus.OK, type: PurchaseEntity })
  findOne(@Param('id') id: string) {
    return this.purchasesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a purchase by ID' })
  @ApiResponse({ status: HttpStatus.OK, type: PurchaseEntity })
  update(@Param('id') id: string, @Body() input: PurchaseDto) {
    return this.purchasesService.update(id, input);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a purchase by ID' })
  @ApiResponse({ status: HttpStatus.OK, type: DeletePurchaseResponseDto })
  remove(@Param('id') id: string) {
    return this.purchasesService.remove(id);
  }
}
