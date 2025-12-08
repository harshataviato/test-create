/**
 * @module migrations/1701999999999-InitialSchema
 * @description
 * TypeORM migration for creating the initial database schema of the PetClinic application.
 * This migration defines all tables, columns, primary keys, foreign keys, and indexes
 * based on the entity definitions.
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * `InitialSchema1701999999999` is a TypeORM migration class responsible for setting up
 * the complete database schema. It includes `up` method for creating tables and `down`
 * method for reverting the changes.
 */
export class InitialSchema1701999999999 implements MigrationInterface {
  name = 'InitialSchema1701999999999'; // A unique name for the migration

  /**
   * Applies the migration, creating all necessary tables and constraints.
   *
   * @param {QueryRunner} queryRunner - The query runner instance to execute database queries.
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create 'specialties' table
    await queryRunner.query(`
            CREATE TABLE "specialties" (
                "id" SERIAL NOT NULL,
                "name" character varying(80) NOT NULL,
                CONSTRAINT "PK_specialties_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`CREATE INDEX "IDX_specialties_name" ON "specialties" ("name") `);

    // Create 'vets' table
    await queryRunner.query(`
            CREATE TABLE "vets" (
                "id" SERIAL NOT NULL,
                "firstName" character varying(30) NOT NULL,
                "lastName" character varying(30) NOT NULL,
                CONSTRAINT "PK_vets_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`CREATE INDEX "IDX_vets_lastName" ON "vets" ("lastName") `);

    // Create 'vet_specialties' junction table
    await queryRunner.query(`
            CREATE TABLE "vet_specialties" (
                "vet_id" integer NOT NULL,
                "specialty_id" integer NOT NULL,
                CONSTRAINT "PK_vet_specialties" PRIMARY KEY ("vet_id", "specialty_id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "vet_specialties" ADD CONSTRAINT "FK_vet_specialties_vet_id" FOREIGN KEY ("vet_id") REFERENCES "vets"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "vet_specialties" ADD CONSTRAINT "FK_vet_specialties_specialty_id" FOREIGN KEY ("specialty_id") REFERENCES "specialties"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

    // Create 'types' table (for PetType)
    await queryRunner.query(`
            CREATE TABLE "types" (
                "id" SERIAL NOT NULL,
                "name" character varying(80) NOT NULL,
                CONSTRAINT "PK_types_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`CREATE INDEX "IDX_types_name" ON "types" ("name") `);

    // Create 'owners' table
    await queryRunner.query(`
            CREATE TABLE "owners" (
                "id" SERIAL NOT NULL,
                "firstName" character varying(30) NOT NULL,
                "lastName" character varying(30) NOT NULL,
                "address" character varying(255) NOT NULL,
                "city" character varying(80) NOT NULL,
                "telephone" character varying(20) NOT NULL,
                CONSTRAINT "PK_owners_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`CREATE INDEX "IDX_owners_lastName" ON "owners" ("lastName") `);

    // Create 'pets' table
    await queryRunner.query(`
            CREATE TABLE "pets" (
                "id" SERIAL NOT NULL,
                "name" character varying(80) NOT NULL,
                "birth_date" date NOT NULL,
                "type_id" integer NOT NULL,
                "owner_id" integer,
                CONSTRAINT "PK_pets_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`CREATE INDEX "IDX_pets_name" ON "pets" ("name") `);
    await queryRunner.query(`CREATE INDEX "IDX_pets_ownerId" ON "pets" ("owner_id") `);
    await queryRunner.query(`
            ALTER TABLE "pets" ADD CONSTRAINT "FK_pets_types_type_id" FOREIGN KEY ("type_id") REFERENCES "types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "pets" ADD CONSTRAINT "FK_pets_owners_owner_id" FOREIGN KEY ("owner_id") REFERENCES "owners"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

    // Create 'visits' table
    await queryRunner.query(`
            CREATE TABLE "visits" (
                "id" SERIAL NOT NULL,
                "date" date NOT NULL,
                "description" character varying(255) NOT NULL,
                "pet_id" integer,
                CONSTRAINT "PK_visits_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`CREATE INDEX "IDX_visits_petId" ON "visits" ("pet_id") `);
    await queryRunner.query(`
            ALTER TABLE "visits" ADD CONSTRAINT "FK_visits_pets_pet_id" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  /**
   * Reverts the migration, dropping all tables created in the `up` method.
   * Note: The order of dropping tables is important due to foreign key constraints.
   *
   * @param {QueryRunner} queryRunner - The query runner instance to execute database queries.
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "visits" DROP CONSTRAINT "FK_visits_pets_pet_id"`);
    await queryRunner.query(`ALTER TABLE "pets" DROP CONSTRAINT "FK_pets_owners_owner_id"`);
    await queryRunner.query(`ALTER TABLE "pets" DROP CONSTRAINT "FK_pets_types_type_id"`);
    await queryRunner.query(`DROP INDEX "IDX_visits_petId"`);
    await queryRunner.query(`DROP TABLE "visits"`);
    await queryRunner.query(`DROP INDEX "IDX_pets_ownerId"`);
    await queryRunner.query(`DROP INDEX "IDX_pets_name"`);
    await queryRunner.query(`DROP TABLE "pets"`);
    await queryRunner.query(`DROP INDEX "IDX_owners_lastName"`);
    await queryRunner.query(`DROP TABLE "owners"`);
    await queryRunner.query(`DROP INDEX "IDX_types_name"`);
    await queryRunner.query(`DROP TABLE "types"`);
    await queryRunner.query(`ALTER TABLE "vet_specialties" DROP CONSTRAINT "FK_vet_specialties_specialty_id"`);
    await queryRunner.query(`ALTER TABLE "vet_specialties" DROP CONSTRAINT "FK_vet_specialties_vet_id"`);
    await queryRunner.query(`DROP TABLE "vet_specialties"`);
    await queryRunner.query(`DROP INDEX "IDX_vets_lastName"`);
    await queryRunner.query(`DROP TABLE "vets"`);
    await queryRunner.query(`DROP INDEX "IDX_specialties_name"`);
    await queryRunner.query(`DROP TABLE "specialties"`);
  }
}
