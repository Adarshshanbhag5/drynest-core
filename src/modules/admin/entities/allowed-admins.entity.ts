import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Repository,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'allowed_admins' })
export class AllowedAdminsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', name: 'email', length: 255, nullable: false })
  email: string;

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

export class AllowedAdminsRepository extends Repository<AllowedAdminsEntity> {}
