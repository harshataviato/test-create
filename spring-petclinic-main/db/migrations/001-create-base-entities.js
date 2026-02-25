/**
 * @file 001-create-base-entities.js
 * @description Sequelize migration to create initial tables for `vets`, `specialties`, `types`, `owners`.
 * This migration corresponds to the `schema.sql` definitions for these core entities.
 * It uses `up` to create tables and `down` to drop them, ensuring reversible migrations.
 * @author Google Senior Engineer
 */

'use strict';

module.exports = {
  /**
   * @function up
   * @description Applies the migration to create the tables.
   * @param {object} queryInterface - The Sequelize QueryInterface object.
   * @param {object} Sequelize - The Sequelize module.
   * @returns {Promise<void>} A promise that resolves when the tables are created.
   */
  up: async (queryInterface, Sequelize) => {
    // Create `vets` table
    await queryInterface.createTable('vets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      first_name: {
        type: Sequelize.STRING(30),
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING(30),
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()')
      }
    });

    // Create `specialties` table
    await queryInterface.createTable('specialties', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(80),
        allowNull: false,
        unique: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()')
      }
    });

    // Create `vet_specialties` join table
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
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()')
      }
    });
    // Add primary key constraint after table creation, as Sequelize's createTable doesn't
    // directly support composite primary keys in the initial object for join tables.
    await queryInterface.addConstraint('vet_specialties', {
      fields: ['vet_id', 'specialty_id'],
      type: 'primary key',
      name: 'vet_specialties_pkey' // Custom name for the primary key constraint
    });


    // Create `types` table (for pet types)
    await queryInterface.createTable('types', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(80),
        allowNull: false,
        unique: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()')
      }
    });

    // Create `owners` table
    await queryInterface.createTable('owners', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      first_name: {
        type: Sequelize.STRING(30),
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING(30),
        allowNull: false
      },
      address: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      city: {
        type: Sequelize.STRING(80),
        allowNull: false
      },
      telephone: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()')
      }
    });

    // Add indexes for improved query performance
    await queryInterface.addIndex('vets', ['last_name']);
    await queryInterface.addIndex('specialties', ['name']);
    await queryInterface.addIndex('types', ['name']);
    await queryInterface.addIndex('owners', ['last_name']);
  },

  /**
   * @function down
   * @description Reverts the migration by dropping the tables in reverse order of creation.
   * @param {object} queryInterface - The Sequelize QueryInterface object.
   * @param {object} Sequelize - The Sequelize module.
   * @returns {Promise<void>} A promise that resolves when the tables are dropped.
   */
  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order to respect foreign key constraints
    await queryInterface.dropTable('vet_specialties');
    await queryInterface.dropTable('specialties');
    await queryInterface.dropTable('vets');
    await queryInterface.dropTable('owners');
    await queryInterface.dropTable('types');
  }
};
