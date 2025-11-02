import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { MaterialEntity } from '../entities/material.entity';
import { MaterialDto, DeleteMaterialResponseDto } from '../dto/material.dto';
import {
  FindAllDto,
  PaginatedResponseDto,
} from 'src/shared/dto/pagination.dto';
import { getPaginationOptions } from 'src/shared/utils/pagination';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MaterialsService {
  private readonly logger = new Logger(MaterialsService.name);
  constructor(
    @InjectRepository(MaterialEntity)
    private readonly materialRepository: Repository<MaterialEntity>,
  ) {}

  private async findMaterialByQuery(
    query:
      | FindOptionsWhere<MaterialEntity>
      | FindOptionsWhere<MaterialEntity>[],
  ): Promise<MaterialEntity | null> {
    return this.materialRepository.findOne({ where: query });
  }

  async create(input: MaterialDto): Promise<MaterialEntity> {
    const isExisting = await this.findMaterialByQuery([
      { code: input.code },
      { name: input.name },
    ]);
    if (isExisting)
      throw new BadRequestException(
        'Material already exists with the same code or name!',
      );
    try {
      const materialId = uuidv4();
      const entity = this.materialRepository.create({
        id: materialId,
        ...input,
      });
      return this.materialRepository.save(entity);
    } catch (error: unknown) {
      this.logger.error('[MaterialsService.create] error:', { error });
      throw error;
    }
  }

  async findAll(
    query: FindAllDto,
  ): Promise<PaginatedResponseDto<MaterialEntity>> {
    try {
      const filterConfig: FindOptionsWhere<MaterialEntity> = {
        ...(query.searchQuery ? { name: ILike(`%${query.searchQuery}%`) } : {}),
      };

      const sortConfig: FindOptionsOrder<MaterialEntity> = {
        [query.sortBy]: query.sortOrder,
      };

      const paginationConfig = getPaginationOptions(
        query.pageNumber,
        query.pageSize,
      );

      const [materials, totalCount] =
        await this.materialRepository.findAndCount({
          where: filterConfig,
          order: sortConfig,
          skip: paginationConfig.skip,
          take: paginationConfig.take,
        });
      return { data: materials, totalCount };
    } catch (error: unknown) {
      this.logger.error('[MaterialsService.findAll] error:', { error });
      throw error;
    }
  }

  async findOne(id: string): Promise<MaterialEntity> {
    try {
      const entity = await this.findMaterialByQuery({ id });
      if (!entity) throw new NotFoundException('Material not found');
      return entity;
    } catch (error: unknown) {
      this.logger.error('[MaterialsService.findOne] error:', { error });
      throw error;
    }
  }

  async update(id: string, input: MaterialDto): Promise<MaterialEntity> {
    try {
      const entity = await this.findOne(id);
      const updatedEntity = this.materialRepository.merge(entity, input);
      return this.materialRepository.save(updatedEntity);
    } catch (error: unknown) {
      this.logger.error('[MaterialsService.update] error:', { error });
      throw error;
    }
  }

  async remove(id: string): Promise<DeleteMaterialResponseDto> {
    try {
      const existing = await this.findOne(id);
      await this.materialRepository.delete(existing.id);
      return {
        success: true,
        message: 'Material deleted successfully',
        id: existing.id,
      };
    } catch (error: unknown) {
      this.logger.error('[MaterialsService.remove] error:', { error });
      throw error;
    }
  }
}
