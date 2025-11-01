import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProcurementMigrations1762021171763 implements MigrationInterface {
  name = 'ProcurementMigrations1762021171763';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "suppliers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "phone" character varying(255) NOT NULL, "email" character varying(255), "address" jsonb NOT NULL DEFAULT '{}', "gstin" character varying(255), "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_b70ac51766a9e3144f778cfe81e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "materials" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying(255) NOT NULL, "name" character varying(255) NOT NULL, "unit" character varying(16) NOT NULL DEFAULT 'kg', "hsn_code" character varying(255), "tax_rate" numeric(5,2) NOT NULL DEFAULT '0', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_2fd1a93ecb222a28bef28663fa0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_5f59d61b51ffcb1db994286221" ON "materials" ("code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "purchase_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "qty" numeric(12,3) NOT NULL, "unit_price" numeric(12,2) NOT NULL, "tax_rate" numeric(5,2) NOT NULL DEFAULT '0', "tax_amount" numeric(12,2) NOT NULL DEFAULT '0', "line_total" numeric(12,2) NOT NULL, "created_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT now(), "purchase_id" uuid NOT NULL, "material_id" uuid NOT NULL, CONSTRAINT "PK_e3d9bea880baad86ff6de3290da" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "purchases" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "purchase_no" character varying(255) NOT NULL, "status" character varying(16) NOT NULL DEFAULT 'DRAFT', "ordered_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "received_at" TIMESTAMP(6) WITH TIME ZONE, "notes" text, "subtotal" numeric(12,2) NOT NULL DEFAULT '0', "tax_total" numeric(12,2) NOT NULL DEFAULT '0', "total" numeric(12,2) NOT NULL DEFAULT '0', "created_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT now(), "supplier_id" uuid NOT NULL, CONSTRAINT "PK_1d55032f37a34c6eceacbbca6b8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d5fec047f705d5b510c19379b9" ON "purchases" ("supplier_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_077f27a2f5a3cc73eba978c3f7" ON "purchases" ("purchase_no") `,
    );
    await queryRunner.query(
      `ALTER TABLE "admin_users" ALTER COLUMN "password_hash" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase_items" ADD CONSTRAINT "FK_607211d59b13e705a673a999ab5" FOREIGN KEY ("purchase_id") REFERENCES "purchases"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase_items" ADD CONSTRAINT "FK_95aa82b448658398d43163d44e0" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchases" ADD CONSTRAINT "FK_d5fec047f705d5b510c19379b95" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "purchases" DROP CONSTRAINT "FK_d5fec047f705d5b510c19379b95"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase_items" DROP CONSTRAINT "FK_95aa82b448658398d43163d44e0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase_items" DROP CONSTRAINT "FK_607211d59b13e705a673a999ab5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin_users" ALTER COLUMN "password_hash" DROP NOT NULL`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_077f27a2f5a3cc73eba978c3f7"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d5fec047f705d5b510c19379b9"`,
    );
    await queryRunner.query(`DROP TABLE "purchases"`);
    await queryRunner.query(`DROP TABLE "purchase_items"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5f59d61b51ffcb1db994286221"`,
    );
    await queryRunner.query(`DROP TABLE "materials"`);
    await queryRunner.query(`DROP TABLE "suppliers"`);
  }
}
