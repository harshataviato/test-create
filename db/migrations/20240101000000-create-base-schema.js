/**
 * @fileoverview Sequelize migration to create the initial database schema for PetClinic.
 * This migration script defines all necessary tables and their relationships (primary keys,
 * foreign keys, indexes) for the PetClinic application. It closely mirrors the
 * `postgres/schema.sql` found in the original Java project.
 *
 * Migration files are timestamped to ensure ordered execution. The timestamp is part of the filename.
 */

'use strict';

/**
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  /**
   * @method up
   * @description Applies the migrations to create tables and their constraints.
   * @param {import('sequelize').QueryInterface} queryInterface - Sequelize QueryInterface instance.
   * @param {import('sequelize').Sequelize} Sequelize - Sequelize library instance.
   * @returns {Promise<void>} A promise that resolves when the migration is complete.
   */
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('vets', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      first_name: {
        type: Sequelize.TEXT,
        allowNull: false // Assuming non-blank names
      },
      last_name: {
        type: Sequelize.TEXT,
        allowNull: false // Assuming non-blank names
      }
    });
    await queryInterface.addIndex('vets', ['last_name'], { name: 'vets_last_name_idx' });

    await queryInterface.createTable('specialties', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false // Assuming non-blank names
      }
    });
    await queryInterface.addIndex('specialties', ['name'], { name: 'specialties_name_idx' });

    await queryInterface.createTable('vet_specialties', {
      vet_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'vets',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      specialty_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'specialties',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }
    });
    await queryInterface.addConstraint('vet_specialties', {
      fields: ['vet_id', 'specialty_id'],
      type: 'unique',
      name: 'vet_specialties_vet_id_specialty_id_key'
    });

    await queryInterface.createTable('types', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false // Assuming non-blank names
      }
    });
    await queryInterface.addIndex('types', ['name'], { name: 'types_name_idx' });

    await queryInterface.createTable('owners', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      first_name: {
        type: Sequelize.TEXT,
        allowNull: false // @NotBlank equivalent
      },
      last_name: {
        type: Sequelize.TEXT,
        allowNull: false // @NotBlank equivalent
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: false // @NotBlank equivalent
      },
      city: {
        type: Sequelize.TEXT,
        allowNull: false // @NotBlank equivalent
      },
      telephone: {
        type: Sequelize.TEXT,
        allowNull: false // @NotBlank equivalent
      }
    });
    await queryInterface.addIndex('owners', ['last_name'], { name: 'owners_last_name_idx' });

    await queryInterface.createTable('pets', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false // Assuming non-blank names
      },
      birth_date: {
        type: Sequelize.DATEONLY,
        allowNull: true // Can be null based on original schema
      },
      type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'types',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT' // Keep RESTRICT as default unless specific CASCADE is needed.
      },
      owner_id: {
        type: Sequelize.INTEGER,
        allowNull: false, // Changed from original schema to NOT NULL for FK integrity in app logic
        references: {
          model: 'owners',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }
    });
    await queryInterface.addIndex('pets', ['name'], { name: 'pets_name_idx' });
    await queryInterface.addIndex('pets', ['owner_id'], { name: 'pets_owner_id_idx' });

    await queryInterface.createTable('visits', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      pet_id: {
        type: Sequelize.INTEGER,
        allowNull: false, // Changed from original schema to NOT NULL for FK integrity in app logic
        references: {
          model: 'pets',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      visit_date: {
        type: Sequelize.DATEONLY,
        allowNull: false // Assuming non-blank dates
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false // @NotBlank equivalent
      }
    });
    await queryInterface.addIndex('visits', ['pet_id'], { name: 'visits_pet_id_idx' });
  },

  /**
   * @method down
   * @description Reverts the migrations by dropping tables.
   * Tables are dropped in reverse order of creation to respect foreign key constraints.
   * @param {import('sequelize').QueryInterface} queryInterface - Sequelize QueryInterface instance.
   * @param {import('sequelize').Sequelize} Sequelize - Sequelize library instance.
   * @returns {Promise<void>} A promise that resolves when the migration is complete.
   */
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('visits');
    await queryInterface.dropTable('pets');
    await queryInterface.dropTable('owners');
    await queryInterface.dropTable('types');
    await queryInterface.dropTable('vet_specialties');
    await queryInterface.dropTable('specialties');
    await queryInterface.dropTable('vets');
  }
};
