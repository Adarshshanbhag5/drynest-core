import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PurchaseEntity } from './purchase.entity';
import { MaterialEntity } from './material.entity';

@Entity({ name: 'purchase_items' })
export class PurchaseItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PurchaseEntity, (p) => p.items, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'purchase_id', referencedColumnName: 'id' })
  purchase: PurchaseEntity;

  @ManyToOne(() => MaterialEntity, { nullable: false })
  @JoinColumn({ name: 'material_id', referencedColumnName: 'id' })
  material: MaterialEntity;

  @Column({ name: 'qty', type: 'numeric', precision: 12, scale: 3 })
  qty: number;

  @Column({ name: 'unit_price', type: 'numeric', precision: 12, scale: 2 })
  unitPrice: number;

  @Column({
    name: 'tax_rate',
    type: 'numeric',
    precision: 5,
    scale: 2,
    default: 0,
  })
  taxRate: number;

  @Column({
    name: 'tax_amount',
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
  })
  taxAmount: number;

  @Column({ name: 'line_total', type: 'numeric', precision: 12, scale: 2 })
  lineTotal: number;

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
