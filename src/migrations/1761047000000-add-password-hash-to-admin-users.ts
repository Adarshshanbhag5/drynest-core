import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPasswordHashToAdminUsers1761047000000
  implements MigrationInterface
{
  name = 'AddPasswordHashToAdminUsers1761047000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "admin_users" ADD COLUMN IF NOT EXISTS "password_hash" varchar(255)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "admin_users" DROP COLUMN IF EXISTS "password_hash"',
    );
  }
}
