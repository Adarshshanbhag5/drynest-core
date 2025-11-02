import { PurchaseItemEntity } from './entities/purchase-item.entity';

export type SupplierAddress = {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type CreatePurchaseItemsResult = {
  items: PurchaseItemEntity[];
  subtotal: number;
  taxTotal: number;
};
