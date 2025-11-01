import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { SupplierAddress } from '../procurement.types';

@Entity({ name: 'suppliers' })
export class SupplierEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', name: 'name', length: 255, nullable: false })
  name: string;

  @Column({ type: 'varchar', name: 'phone', length: 255, nullable: false })
  phone: string;

  @Column({
    type: 'varchar',
    name: 'email',
    length: 255,
    nullable: true,
    default: null,
  })
  email: string;

  @Column({ type: 'jsonb', name: 'address', nullable: false, default: {} })
  address: SupplierAddress;

  @Column({
    type: 'varchar',
    name: 'gstin',
    length: 255,
    nullable: true,
    default: null,
  })
  gstin: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

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
