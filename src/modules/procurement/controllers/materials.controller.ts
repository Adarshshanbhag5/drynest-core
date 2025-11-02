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
import { MaterialsService } from '../services/materials.service';
import { MaterialDto, DeleteMaterialResponseDto } from '../dto/material.dto';
import { MaterialEntity } from '../entities/material.entity';
import {
  FindAllDto,
  PaginatedResponseDto,
} from 'src/shared/dto/pagination.dto';

@ApiTags('procurement/materials')
@Controller('procurement/materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new material' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The material has been successfully created.',
    type: MaterialEntity,
  })
  create(@Body() input: MaterialDto) {
    return this.materialsService.create(input);
  }

  @Get()
  @ApiOperation({ summary: 'Get all materials' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PaginatedResponseDto<MaterialEntity>,
  })
  findAll(@Query() query: FindAllDto) {
    return this.materialsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a material by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The material has been successfully retrieved.',
    type: MaterialEntity,
  })
  findOne(@Param('id') id: string) {
    return this.materialsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a material by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The material has been successfully updated.',
    type: MaterialEntity,
  })
  update(@Param('id') id: string, @Body() input: MaterialDto) {
    return this.materialsService.update(id, input);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a material by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The material has been successfully deleted.',
    type: DeleteMaterialResponseDto,
  })
  remove(@Param('id') id: string) {
    return this.materialsService.remove(id);
  }
}
