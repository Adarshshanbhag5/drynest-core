import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SuppliersService } from '../services/suppliers.service';
import { SupplierDto, DeleteSupplierResponseDto } from '../dto/supplier.dto';
import { SupplierEntity } from '../entities/supplier.entity';
import {
  FindAllDto,
  PaginatedResponseDto,
} from 'src/shared/dto/pagination.dto';
import { Query } from '@nestjs/common';

@ApiTags('procurement/suppliers')
@Controller('procurement/suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new supplier' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The supplier has been successfully created.',
    type: SupplierEntity,
  })
  create(@Body() input: SupplierDto) {
    return this.suppliersService.create(input);
  }

  @Get()
  @ApiOperation({ summary: 'Get all suppliers' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PaginatedResponseDto<SupplierEntity>,
  })
  findAll(@Query() query: FindAllDto) {
    return this.suppliersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a supplier by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SupplierEntity,
  })
  findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a supplier by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The supplier has been successfully updated.',
    type: SupplierEntity,
  })
  update(@Param('id') id: string, @Body() input: SupplierDto) {
    return this.suppliersService.update(id, input);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a supplier by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The supplier has been successfully deleted.',
    type: DeleteSupplierResponseDto,
  })
  remove(@Param('id') id: string) {
    return this.suppliersService.remove(id);
  }
}
