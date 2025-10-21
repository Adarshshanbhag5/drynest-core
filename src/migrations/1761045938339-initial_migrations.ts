import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigrations1761045938339 implements MigrationInterface {
  name = 'InitialMigrations1761045938339';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "allowed_admins" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "created_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_52a64d457ec1db086e48052ad1c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "admin_users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "role" character varying(255) NOT NULL DEFAULT 'ADMIN', "tokens" text array NOT NULL DEFAULT '{}', "created_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_06744d221bb6145dc61e5dc441d" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "admin_users"`);
    await queryRunner.query(`DROP TABLE "allowed_admins"`);
  }
}
