import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { PurchaseItemEntity } from '../entities/purchase-item.entity';
import {
  PurchaseItemDto,
  DeletePurchaseItemResponseDto,
} from '../dto/purchase-item.dto';
import { PurchaseEntity } from '../entities/purchase.entity';
import { MaterialEntity } from '../entities/material.entity';
import {
  FindAllDto,
  PaginatedResponseDto,
} from 'src/shared/dto/pagination.dto';
import { getPaginationOptions } from 'src/shared/utils/pagination';

@Injectable()
export class PurchaseItemsService {
  private readonly logger = new Logger(PurchaseItemsService.name);
  constructor(
    @InjectRepository(PurchaseItemEntity)
    private readonly purchaseItemRepository: Repository<PurchaseItemEntity>,
    @InjectRepository(PurchaseEntity)
    private readonly purchaseRepository: Repository<PurchaseEntity>,
    @InjectRepository(MaterialEntity)
    private readonly materialRepository: Repository<MaterialEntity>,
  ) {}

  computeAmounts(qty: number, unitPrice: number, taxRate = 0) {
    const subtotal = Number(qty) * Number(unitPrice);
    const taxAmount = (subtotal * Number(taxRate ?? 0)) / 100;
    const lineTotal = subtotal + taxAmount;
    return { taxAmount, lineTotal };
  }

  private async recalcPurchaseTotals(purchaseId: string): Promise<void> {
    const items = await this.purchaseItemRepository.find({
      where: { purchase: { id: purchaseId } },
    });
    let subtotal = 0;
    let taxTotal = 0;
    for (const item of items) {
      subtotal += Number(item.qty) * Number(item.unitPrice);
      taxTotal += Number(item.taxAmount);
    }
    const purchase = await this.purchaseRepository.findOne({
      where: { id: purchaseId },
    });
    if (!purchase) return;
    purchase.subtotal = subtotal;
    purchase.taxTotal = taxTotal;
    purchase.total = subtotal + taxTotal;
    await this.purchaseRepository.save(purchase);
  }

  async create(input: PurchaseItemDto): Promise<PurchaseItemEntity> {
    try {
      const purchase = await this.purchaseRepository.findOne({
        where: { id: input.purchaseId },
      });
      if (!purchase) throw new NotFoundException('Purchase not found');
      const material = await this.materialRepository.findOne({
        where: { id: input.materialId },
      });
      if (!material) throw new NotFoundException('Material not found');

      const { taxAmount, lineTotal } = this.computeAmounts(
        input.qty,
        input.unitPrice,
        input.taxRate ?? material.taxRate ?? 0,
      );

      const entity = this.purchaseItemRepository.create({
        purchase,
        material,
        qty: input.qty,
        unitPrice: input.unitPrice,
        taxRate: input.taxRate ?? material.taxRate ?? 0,
        taxAmount,
        lineTotal,
      });
      const saved = await this.purchaseItemRepository.save(entity);
      await this.recalcPurchaseTotals(purchase.id);
      return saved;
    } catch (error: unknown) {
      this.logger.error('[PurchaseItemsService.create] error:', { error });
      throw error;
    }
  }

  async findAll(
    query: FindAllDto,
  ): Promise<PaginatedResponseDto<PurchaseItemEntity>> {
    try {
      const where:
        | FindOptionsWhere<PurchaseItemEntity>[]
        | FindOptionsWhere<PurchaseItemEntity> = query.searchQuery
        ? [
            {
              material: {
                name: ILike(`%${query.searchQuery}%`),
              } as unknown as MaterialEntity,
            } as unknown as FindOptionsWhere<PurchaseItemEntity>,
            {
              purchase: {
                purchaseNo: ILike(`%${query.searchQuery}%`),
              } as unknown as PurchaseEntity,
            } as unknown as FindOptionsWhere<PurchaseItemEntity>,
          ]
        : {};
      const order: FindOptionsOrder<PurchaseItemEntity> = {
        [query.sortBy]: query.sortOrder,
      };
      const pagination = getPaginationOptions(query.pageNumber, query.pageSize);
      const [items, totalCount] =
        await this.purchaseItemRepository.findAndCount({
          where,
          order,
          relations: { purchase: true, material: true },
          skip: pagination.skip,
          take: pagination.take,
        });
      return { data: items, totalCount };
    } catch (error: unknown) {
      this.logger.error('[PurchaseItemsService.findAll] error:', { error });
      throw error;
    }
  }

  async findOne(id: string): Promise<PurchaseItemEntity> {
    try {
      const entity = await this.purchaseItemRepository.findOne({
        where: { id },
        relations: { purchase: true, material: true },
      });
      if (!entity) throw new NotFoundException('Purchase item not found');
      return entity;
    } catch (error: unknown) {
      this.logger.error('[PurchaseItemsService.findOne] error:', { error });
      throw error;
    }
  }

  async update(
    id: string,
    input: PurchaseItemDto,
  ): Promise<PurchaseItemEntity> {
    try {
      const entity = await this.findOne(id);
      if (input.materialId) {
        const material = await this.materialRepository.findOne({
          where: { id: input.materialId },
        });
        if (!material) throw new NotFoundException('Material not found');
        entity.material = material;
      }
      const { taxAmount, lineTotal } = this.computeAmounts(
        entity.qty,
        entity.unitPrice,
        entity.taxRate,
      );
      const updatedEntity = this.purchaseItemRepository.merge(entity, {
        ...input,
        taxAmount,
        lineTotal,
      });
      const saved = await this.purchaseItemRepository.save(updatedEntity);
      await this.recalcPurchaseTotals(entity.purchase.id);
      return saved;
    } catch (error: unknown) {
      this.logger.error('[PurchaseItemsService.update] error:', { error });
      throw error;
    }
  }

  async remove(id: string): Promise<DeletePurchaseItemResponseDto> {
    try {
      const existing = await this.findOne(id);
      await this.purchaseItemRepository.delete(existing.id);
      await this.recalcPurchaseTotals(existing.purchase.id);
      return {
        success: true,
        message: 'Purchase item deleted successfully',
        id: existing.id,
      };
    } catch (error: unknown) {
      this.logger.error('[PurchaseItemsService.remove] error:', { error });
      throw error;
    }
  }
}
