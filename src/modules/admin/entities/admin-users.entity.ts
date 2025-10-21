import { AdminUserRole } from 'src/shared/enums';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'admin_users' })
export class AdminUsersEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', name: 'email', length: 255, nullable: false })
  email: string;

  @Column({
    type: 'varchar',
    name: 'password_hash',
    length: 255,
    nullable: false,
  })
  passwordHash: string;

  @Column({
    type: 'varchar',
    name: 'role',
    length: 255,
    nullable: false,
    enum: AdminUserRole,
    default: AdminUserRole.ADMIN,
  })
  role: string;

  @Column({
    type: 'text',
    name: 'tokens',
    array: true,
    default: [],
  })
  tokens: string[];

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
