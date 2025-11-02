import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { SupplierEntity } from '../entities/supplier.entity';
import { SupplierDto, DeleteSupplierResponseDto } from '../dto/supplier.dto';
import {
  FindAllDto,
  PaginatedResponseDto,
} from 'src/shared/dto/pagination.dto';
import { getPaginationOptions } from 'src/shared/utils/pagination';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SuppliersService {
  private readonly logger = new Logger(SuppliersService.name);
  constructor(
    @InjectRepository(SupplierEntity)
    private readonly supplierRepository: Repository<SupplierEntity>,
  ) {}

  async create(input: SupplierDto): Promise<SupplierEntity> {
    try {
      const isExisting = await this.supplierRepository.findOne({
        where: [
          { phone: input.phone },
          ...(input.email ? [{ email: input.email }] : []),
        ],
      });
      if (isExisting) {
        throw new BadRequestException(
          'Supplier already exists with the same phone or email!',
        );
      }
      const entity = this.supplierRepository.create({
        id: uuidv4(),
        ...input,
      });
      return this.supplierRepository.save(entity);
    } catch (error: unknown) {
      this.logger.error('[SuppliersService.create] error:', { error });
      throw error;
    }
  }

  async findAll(
    query: FindAllDto,
  ): Promise<PaginatedResponseDto<SupplierEntity>> {
    try {
      const where:
        | FindOptionsWhere<SupplierEntity>[]
        | FindOptionsWhere<SupplierEntity> = query.searchQuery
        ? [
            { name: ILike(`%${query.searchQuery}%`) },
            { phone: ILike(`%${query.searchQuery}%`) },
            { email: ILike(`%${query.searchQuery}%`) },
          ]
        : {};

      const order: FindOptionsOrder<SupplierEntity> = {
        [query.sortBy]: query.sortOrder,
      };

      const pagination = getPaginationOptions(query.pageNumber, query.pageSize);
      const [suppliers, totalCount] =
        await this.supplierRepository.findAndCount({
          where,
          order,
          skip: pagination.skip,
          take: pagination.take,
        });
      return { data: suppliers, totalCount };
    } catch (error: unknown) {
      this.logger.error('[SuppliersService.findAll] error:', { error });
      throw error;
    }
  }

  async findOne(id: string): Promise<SupplierEntity> {
    try {
      const entity = await this.supplierRepository.findOne({ where: { id } });
      if (!entity) throw new NotFoundException('Supplier not found');
      return entity;
    } catch (error: unknown) {
      this.logger.error('[SuppliersService.findOne] error:', { error });
      throw error;
    }
  }

  async update(id: string, input: SupplierDto): Promise<SupplierEntity> {
    try {
      const entity = await this.findOne(id);
      const updatedEntity = this.supplierRepository.merge(entity, input);
      return this.supplierRepository.save(updatedEntity);
    } catch (error: unknown) {
      this.logger.error('[SuppliersService.update] error:', { error });
      throw error;
    }
  }

  async remove(id: string): Promise<DeleteSupplierResponseDto> {
    try {
      const existing = await this.findOne(id);
      await this.supplierRepository.delete(existing.id);
      return {
        success: true,
        message: 'Supplier deleted successfully',
        id: existing.id,
      };
    } catch (error: unknown) {
      this.logger.error('[SuppliersService.remove] error:', { error });
      throw error;
    }
  }
}
