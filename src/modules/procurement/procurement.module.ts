import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialEntity } from './entities/material.entity';
import { SupplierEntity } from './entities/supplier.entity';
import { PurchaseEntity } from './entities/purchase.entity';
import { PurchaseItemEntity } from './entities/purchase-item.entity';
import { MaterialsService } from './services/materials.service';
import { SuppliersService } from './services/suppliers.service';
import { PurchasesService } from './services/purchases.service';
import { PurchaseItemsService } from './services/purchase-items.service';
import { MaterialsController } from './controllers/materials.controller';
import { SuppliersController } from './controllers/suppliers.controller';
import { PurchasesController } from './controllers/purchases.controller';
import { PurchaseItemsController } from './controllers/purchase-items.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MaterialEntity,
      SupplierEntity,
      PurchaseEntity,
      PurchaseItemEntity,
    ]),
  ],
  controllers: [
    MaterialsController,
    SuppliersController,
    PurchasesController,
    PurchaseItemsController,
  ],
  providers: [
    MaterialsService,
    SuppliersService,
    PurchasesService,
    PurchaseItemsService,
  ],
  exports: [
    MaterialsService,
    SuppliersService,
    PurchasesService,
    PurchaseItemsService,
  ],
})
export class ProcurementModule {}
