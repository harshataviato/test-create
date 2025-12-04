import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * @module Migrations
 * @description
 * This migration creates the initial database schema for the PetClinic application.
 * It sets up tables for vets, specialties, vet_specialties (join table), pet types,
 * owners, pets, and visits, mirroring the original Spring PetClinic H2/PostgreSQL schema.
 * IDs are generated automatically, and appropriate foreign key constraints are defined.
 */
export class InitialSchema1701010000000 implements MigrationInterface {
  name = 'InitialSchema1701010000000'; // Unique name for the migration

  /**
   * Applies the migration, creating all necessary tables and indexes.
   *
   * @param {QueryRunner} queryRunner - The query runner to execute database queries.
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create 'vets' table
    await queryRunner.query(`
            CREATE TABLE "vets" (
                "id" SERIAL NOT NULL,
                "first_name" character varying(30) NOT NULL,
                "last_name" character varying(30) NOT NULL,
                CONSTRAINT "PK_556d70a498c894ad7d727a8581e" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`CREATE INDEX "IDX_vets_last_name" ON "vets" ("last_name") `);

    // Create 'specialties' table
    await queryRunner.query(`
            CREATE TABLE "specialties" (
                "id" SERIAL NOT NULL,
                "name" character varying(80) NOT NULL,
                CONSTRAINT "PK_d8139cf0e972ec932e030386629" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`CREATE INDEX "IDX_specialties_name" ON "specialties" ("name") `);

    // Create 'vet_specialties' join table
    await queryRunner.query(`
            CREATE TABLE "vet_specialties" (
                "vet_id" integer NOT NULL,
                "specialty_id" integer NOT NULL,
                CONSTRAINT "PK_a3f81e59275a9e3d9e03d3c8c7f" PRIMARY KEY ("vet_id", "specialty_id")
            )
        `);
    // Add foreign key constraints to 'vet_specialties'
    await queryRunner.query(`
            ALTER TABLE "vet_specialties" ADD CONSTRAINT "FK_vet_specialties_vet" FOREIGN KEY ("vet_id") REFERENCES "vets"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "vet_specialties" ADD CONSTRAINT "FK_vet_specialties_specialty" FOREIGN KEY ("specialty_id") REFERENCES "specialties"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);

    // Create 'types' table
    await queryRunner.query(`
            CREATE TABLE "types" (
                "id" SERIAL NOT NULL,
                "name" character varying(80) NOT NULL,
                CONSTRAINT "PK_3047d780ef46062f6b8bb892c97" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`CREATE INDEX "IDX_types_name" ON "types" ("name") `);

    // Create 'owners' table
    await queryRunner.query(`
            CREATE TABLE "owners" (
                "id" SERIAL NOT NULL,
                "first_name" character varying(30) NOT NULL,
                "last_name" character varying(30) NOT NULL,
                "address" character varying(255) NOT NULL,
                "city" character varying(80) NOT NULL,
                "telephone" character varying(20) NOT NULL,
                CONSTRAINT "PK_85764ec63e6e84d720c02506e30" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`CREATE INDEX "IDX_owners_last_name" ON "owners" ("last_name") `);

    // Create 'pets' table
    await queryRunner.query(`
            CREATE TABLE "pets" (
                "id" SERIAL NOT NULL,
                "name" character varying(30) NOT NULL,
                "birth_date" date NOT NULL,
                "type_id" integer NOT NULL,
                "owner_id" integer NOT NULL,
                CONSTRAINT "PK_d87b32626e2541ac3d026779435" PRIMARY KEY ("id")
            )
        `);
    // Add foreign key constraints to 'pets'
    await queryRunner.query(`
            ALTER TABLE "pets" ADD CONSTRAINT "FK_pets_type" FOREIGN KEY ("type_id") REFERENCES "types"("id") ON DELETE RESTRICT ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "pets" ADD CONSTRAINT "FK_pets_owner" FOREIGN KEY ("owner_id") REFERENCES "owners"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`CREATE INDEX "IDX_pets_name" ON "pets" ("name") `);

    // Create 'visits' table
    await queryRunner.query(`
            CREATE TABLE "visits" (
                "id" SERIAL NOT NULL,
                "visit_date" date NOT NULL,
                "description" character varying(255) NOT NULL,
                "pet_id" integer NOT NULL,
                CONSTRAINT "PK_be5d44747754b732552f6f4c47f" PRIMARY KEY ("id")
            )
        `);
    // Add foreign key constraint to 'visits'
    await queryRunner.query(`
            ALTER TABLE "visits" ADD CONSTRAINT "FK_visits_pet" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`CREATE INDEX "IDX_visits_pet_id" ON "visits" ("pet_id") `);
  }

  /**
   * Reverts the migration, dropping all tables created by the `up` method.
   * Note: The order of dropping tables is important due to foreign key dependencies.
   *
   * @param {QueryRunner} queryRunner - The query runner to execute database queries.
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_visits_pet_id"`);
    await queryRunner.query(`DROP INDEX "IDX_pets_name"`);
    await queryRunner.query(`DROP INDEX "IDX_owners_last_name"`);
    await queryRunner.query(`DROP INDEX "IDX_types_name"`);
    await queryRunner.query(`DROP INDEX "IDX_specialties_name"`);
    await queryRunner.query(`DROP INDEX "IDX_vets_last_name"`);

    // Drop foreign key constraints
    await queryRunner.query(`ALTER TABLE "visits" DROP CONSTRAINT "FK_visits_pet"`);
    await queryRunner.query(`ALTER TABLE "pets" DROP CONSTRAINT "FK_pets_owner"`);
    await queryRunner.query(`ALTER TABLE "pets" DROP CONSTRAINT "FK_pets_type"`);
    await queryRunner.query(`ALTER TABLE "vet_specialties" DROP CONSTRAINT "FK_vet_specialties_specialty"`);
    await queryRunner.query(`ALTER TABLE "vet_specialties" DROP CONSTRAINT "FK_vet_specialties_vet"`);

    // Drop tables in reverse dependency order
    await queryRunner.query(`DROP TABLE "visits"`);
    await queryRunner.query(`DROP TABLE "pets"`);
    await queryRunner.query(`DROP TABLE "owners"`);
    await queryRunner.query(`DROP TABLE "types"`);
    await queryRunner.query(`DROP TABLE "vet_specialties"`);
    await queryRunner.query(`DROP TABLE "specialties"`);
    await queryRunner.query(`DROP TABLE "vets"`);
  }
}
