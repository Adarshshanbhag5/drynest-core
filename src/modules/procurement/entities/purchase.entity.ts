import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SupplierEntity } from './supplier.entity';
import { PurchaseItemEntity } from './purchase-item.entity';
import { PurchaseStatus } from '../procurement.enums';

@Entity({ name: 'purchases' })
@Index(['purchaseNo'], { unique: true })
@Index(['supplier'], { unique: false })
export class PurchaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'purchase_no', type: 'varchar', length: 255 })
  purchaseNo: string;

  @ManyToOne(() => SupplierEntity, { nullable: false })
  @JoinColumn({ name: 'supplier_id', referencedColumnName: 'id' })
  supplier: SupplierEntity;

  @Column({
    type: 'varchar',
    length: 16,
    default: PurchaseStatus.DRAFT,
    enum: PurchaseStatus,
    nullable: false,
  })
  status: PurchaseStatus;

  @Column({
    name: 'ordered_at',
    type: 'timestamptz',
    nullable: false,
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  orderedAt: Date;

  @Column({
    name: 'received_at',
    type: 'timestamptz',
    nullable: true,
    precision: 6,
    default: null,
  })
  receivedAt?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  subtotal: number;

  @Column({
    name: 'tax_total',
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
  })
  taxTotal: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  total: number;

  @OneToMany(() => PurchaseItemEntity, (i) => i.purchase, {
    cascade: ['insert'],
  })
  items: PurchaseItemEntity[];

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    nullable: false,
    precision: 6,
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    nullable: false,
    precision: 6,
  })
  updatedAt: Date;
}
