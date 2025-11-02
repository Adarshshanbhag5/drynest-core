import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { PurchaseEntity } from '../entities/purchase.entity';
import { SupplierEntity } from '../entities/supplier.entity';
import { MaterialEntity } from '../entities/material.entity';
import { PurchaseItemEntity } from '../entities/purchase-item.entity';
import { PurchaseDto, DeletePurchaseResponseDto } from '../dto/purchase.dto';
import {
  FindAllDto,
  PaginatedResponseDto,
} from 'src/shared/dto/pagination.dto';
import { getPaginationOptions } from 'src/shared/utils/pagination';
import { v4 as uuidv4 } from 'uuid';
import { CreatePurchaseItemForPurchaseDto } from '../dto/purchase-item.dto';
import { CreatePurchaseItemsResult } from '../procurement.types';

@Injectable()
export class PurchasesService {
  private readonly logger = new Logger(PurchasesService.name);
  constructor(
    @InjectRepository(PurchaseEntity)
    private readonly purchaseRepository: Repository<PurchaseEntity>,
    @InjectRepository(SupplierEntity)
    private readonly supplierRepository: Repository<SupplierEntity>,
    @InjectRepository(MaterialEntity)
    private readonly materialRepository: Repository<MaterialEntity>,
    @InjectRepository(PurchaseItemEntity)
    private readonly purchaseItemRepository: Repository<PurchaseItemEntity>,
  ) {}

  async create(input: PurchaseDto): Promise<PurchaseEntity> {
    try {
      const supplier = await this.supplierRepository.findOne({
        where: { id: input.supplierId },
      });
      if (!supplier) {
        throw new NotFoundException('Supplier not found');
      }

      const existing = await this.purchaseRepository.findOne({
        where: { purchaseNo: input.purchaseNo },
      });
      if (existing) {
        throw new BadRequestException(
          'Purchase already exists with this number',
        );
      }

      const purchase = this.purchaseRepository.create({
        id: uuidv4(),
        purchaseNo: input.purchaseNo,
        supplier,
        status: input.status,
        orderedAt: input.orderedAt ? new Date(input.orderedAt) : new Date(),
        notes: input.notes,
      });

      const { items, subtotal, taxTotal } = await this.createPurchaseItems(
        input.items,
      );
      purchase.subtotal = subtotal;
      purchase.taxTotal = taxTotal;
      purchase.total = subtotal + taxTotal;
      purchase.items = items;

      return this.purchaseRepository.save(purchase);
    } catch (error: unknown) {
      this.logger.error('[PurchasesService.create] error:', { error });
      throw error;
    }
  }

  async findAll(
    query: FindAllDto,
  ): Promise<PaginatedResponseDto<PurchaseEntity>> {
    try {
      const where:
        | FindOptionsWhere<PurchaseEntity>[]
        | FindOptionsWhere<PurchaseEntity> = query.searchQuery
        ? [
            { purchaseNo: ILike(`%${query.searchQuery}%`) },
            {
              supplier: {
                name: ILike(`%${query.searchQuery}%`),
              },
            },
          ]
        : {};
      const order: FindOptionsOrder<PurchaseEntity> = {
        [query.sortBy]: query.sortOrder,
      };
      const pagination = getPaginationOptions(query.pageNumber, query.pageSize);
      const [purchases, totalCount] =
        await this.purchaseRepository.findAndCount({
          where,
          order,
          relations: { supplier: true, items: { material: true } },
          ...pagination,
        });
      return { data: purchases, totalCount };
    } catch (error: unknown) {
      this.logger.error('[PurchasesService.findAll] error:', { error });
      throw error;
    }
  }

  async findOne(id: string): Promise<PurchaseEntity> {
    try {
      const entity = await this.purchaseRepository.findOne({
        where: { id },
        relations: { supplier: true, items: { material: true } },
      });
      if (!entity) throw new NotFoundException('Purchase not found');
      return entity;
    } catch (error: unknown) {
      this.logger.error('[PurchasesService.findOne] error:', { error });
      throw error;
    }
  }

  async update(id: string, input: PurchaseDto): Promise<PurchaseEntity> {
    try {
      const purchase = await this.findOne(id);
      const updatedEntity = this.purchaseRepository.merge(purchase, input);
      const { items, subtotal, taxTotal } = await this.createPurchaseItems(
        input.items ?? [],
      );
      updatedEntity.items = items;
      updatedEntity.subtotal = subtotal;
      updatedEntity.taxTotal = taxTotal;
      updatedEntity.total = subtotal + taxTotal;
      return this.purchaseRepository.save(updatedEntity);
    } catch (error: unknown) {
      this.logger.error('[PurchasesService.update] error:', { error });
      throw error;
    }
  }

  async remove(id: string): Promise<DeletePurchaseResponseDto> {
    try {
      const existing = await this.findOne(id);
      await this.purchaseRepository.delete(existing.id);
      return {
        success: true,
        message: 'Purchase deleted successfully',
        id: existing.id,
      };
    } catch (error: unknown) {
      this.logger.error('[PurchasesService.remove] error:', { error });
      throw error;
    }
  }

  private computeLineTotals(
    qty: number,
    unitPrice: number,
    taxRate = 0,
  ): { taxAmount: number; lineTotal: number } {
    const subtotal = Number(qty) * Number(unitPrice);
    const taxAmount = (subtotal * Number(taxRate ?? 0)) / 100;
    return { taxAmount, lineTotal: subtotal + taxAmount };
  }

  private async createPurchaseItems(
    purchaseItems: CreatePurchaseItemForPurchaseDto[],
  ): Promise<CreatePurchaseItemsResult> {
    let subtotal = 0;
    let taxTotal = 0;
    const items: PurchaseItemEntity[] = [];
    for (const item of purchaseItems ?? []) {
      const material = await this.materialRepository.findOne({
        where: { id: item.materialId },
      });
      if (!material) {
        throw new NotFoundException('Material not found');
      }
      const taxRate =
        typeof item.taxRate === 'number'
          ? item.taxRate
          : (material.taxRate ?? 0);
      const { taxAmount, lineTotal } = this.computeLineTotals(
        item.qty,
        item.unitPrice,
        taxRate,
      );
      subtotal += Number(item.qty) * Number(item.unitPrice);
      taxTotal += taxAmount;

      items.push(
        this.purchaseItemRepository.create({
          material,
          qty: item.qty,
          unitPrice: item.unitPrice,
          taxRate,
          taxAmount,
          lineTotal,
        }),
      );
    }
    return { items, subtotal, taxTotal };
  }
}
