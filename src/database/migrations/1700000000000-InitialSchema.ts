/**
 * @module database/migrations/1700000000000-InitialSchema
 * @description TypeORM migration to create the initial database schema for the PetClinic application.
 *              This migration defines all necessary tables and their relationships.
 */

import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

/**
 * @class InitialSchema1700000000000
 * @implements {MigrationInterface}
 * @description TypeORM migration class to create the database schema.
 */
export class InitialSchema1700000000000 implements MigrationInterface {
  /**
   * @property {string} name
   * @description Name of the migration.
   */
  public readonly name = 'InitialSchema1700000000000';

  /**
   * @method up
   * @description Applies the migration to create tables and indexes.
   * @param {QueryRunner} queryRunner - The query runner instance.
   * @returns {Promise<void>}
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create 'vets' table
    await queryRunner.createTable(
      new Table({
        name: 'vets',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'first_name',
            type: 'varchar',
            length: '30',
            isNullable: false,
          },
          {
            name: 'last_name',
            type: 'varchar',
            length: '30',
            isNullable: false,
          },
        ],
      }),
      true
    );
    await queryRunner.createIndex(
      'vets',
      new TableIndex({ name: 'IDX_VETS_LAST_NAME', columnNames: ['last_name'] })
    );

    // Create 'specialties' table
    await queryRunner.createTable(
      new Table({
        name: 'specialties',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '80',
            isNullable: false,
            isUnique: true, // Specialty names should be unique
          },
        ],
      }),
      true
    );
    await queryRunner.createIndex(
      'specialties',
      new TableIndex({ name: 'IDX_SPECIALTIES_NAME', columnNames: ['name'] })
    );

    // Create 'vet_specialties' join table
    await queryRunner.createTable(
      new Table({
        name: 'vet_specialties',
        columns: [
          {
            name: 'vet_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'specialty_id',
            type: 'int',
            isNullable: false,
          },
        ],
      }),
      true
    );
    await queryRunner.createIndex(
      'vet_specialties',
      new TableIndex({
        name: 'PK_VET_SPECIALTIES',
        columnNames: ['vet_id', 'specialty_id'],
        isUnique: true,
      })
    );
    await queryRunner.createForeignKey(
      'vet_specialties',
      new TableForeignKey({
        columnNames: ['vet_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'vets',
        onDelete: 'CASCADE', // If a vet is deleted, remove their specialties entries
      })
    );
    await queryRunner.createForeignKey(
      'vet_specialties',
      new TableForeignKey({
        columnNames: ['specialty_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'specialties',
        onDelete: 'CASCADE', // If a specialty is deleted, remove it from vets
      })
    );

    // Create 'types' table (for PetType)
    await queryRunner.createTable(
      new Table({
        name: 'types',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '80',
            isNullable: false,
            isUnique: true, // PetType names should be unique
          },
        ],
      }),
      true
    );
    await queryRunner.createIndex(
      'types',
      new TableIndex({ name: 'IDX_TYPES_NAME', columnNames: ['name'] })
    );

    // Create 'owners' table
    await queryRunner.createTable(
      new Table({
        name: 'owners',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'first_name',
            type: 'varchar',
            length: '30',
            isNullable: false,
          },
          {
            name: 'last_name',
            type: 'varchar',
            length: '30',
            isNullable: false,
          },
          {
            name: 'address',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'city',
            type: 'varchar',
            length: '80',
            isNullable: false,
          },
          {
            name: 'telephone',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
        ],
      }),
      true
    );
    await queryRunner.createIndex(
      'owners',
      new TableIndex({ name: 'IDX_OWNERS_LAST_NAME', columnNames: ['last_name'] })
    );

    // Create 'pets' table
    await queryRunner.createTable(
      new Table({
        name: 'pets',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '30',
            isNullable: false,
          },
          {
            name: 'birth_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'type_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'owner_id',
            type: 'int',
            isNullable: false, // Owner is required for a pet
          },
        ],
      }),
      true
    );
    await queryRunner.createIndex(
      'pets',
      new TableIndex({ name: 'IDX_PETS_NAME', columnNames: ['name'] })
    );
    await queryRunner.createForeignKey(
      'pets',
      new TableForeignKey({
        columnNames: ['type_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'types',
        onDelete: 'RESTRICT', // Prevent deleting pet types if pets exist
      })
    );
    await queryRunner.createForeignKey(
      'pets',
      new TableForeignKey({
        columnNames: ['owner_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'owners',
        onDelete: 'CASCADE', // If an owner is deleted, their pets are deleted
      })
    );

    // Create 'visits' table
    await queryRunner.createTable(
      new Table({
        name: 'visits',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'pet_id',
            type: 'int',
            isNullable: false, // Pet is required for a visit
          },
          {
            name: 'visit_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
        ],
      }),
      true
    );
    await queryRunner.createIndex(
      'visits',
      new TableIndex({ name: 'IDX_VISITS_PET_ID', columnNames: ['pet_id'] })
    );
    await queryRunner.createForeignKey(
      'visits',
      new TableForeignKey({
        columnNames: ['pet_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'pets',
        onDelete: 'CASCADE', // If a pet is deleted, their visits are deleted
      })
    );
  }

  /**
   * @method down
   * @description Reverts the migration by dropping tables.
   * @param {QueryRunner} queryRunner - The query runner instance.
   * @returns {Promise<void>}
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('visits');
    await queryRunner.dropTable('pets');
    await queryRunner.dropTable('owners');
    await queryRunner.dropTable('vet_specialties');
    await queryRunner.dropTable('specialties');
    await queryRunner.dropTable('vets');
    await queryRunner.dropTable('types');
  }
}
