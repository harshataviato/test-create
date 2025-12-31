/**
 * @module migrations/20230101000000-create-initial-tables
 * @description This migration file creates the initial database schema for the PetClinic application.
 * It defines tables for Owners, PetTypes, Pets, Vets, Specialties, Visits, and the VetSpecialty join table.
 */

'use strict';

/**
 * @function up
 * @description Executes the migration to create all necessary tables.
 * @param {import('sequelize').QueryInterface} queryInterface - The Sequelize QueryInterface.
 * @param {import('sequelize').Sequelize} Sequelize - The Sequelize instance.
 * @returns {Promise<void>}
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create Owners table
    await queryInterface.createTable('Owners', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      address: {
        type: Sequelize.STRING
      },
      city: {
        type: Sequelize.STRING
      },
      telephone: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create PetTypes table
    await queryInterface.createTable('PetTypes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create Pets table
    await queryInterface.createTable('Pets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      birthDate: {
        type: Sequelize.DATEONLY, // Store only date, no time
        allowNull: false
      },
      typeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'PetTypes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT' // Prevent deleting PetType if pets exist
      },
      ownerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Owners',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // If owner is deleted, pets are deleted
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create Visits table
    await queryInterface.createTable('Visits', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      petId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Pets',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // If pet is deleted, visits are deleted
      },
      visitDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create Vets table
    await queryInterface.createTable('Vets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create Specialties table
    await queryInterface.createTable('Specialties', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create VetSpecialties (junction table for many-to-many relationship)
    await queryInterface.createTable('VetSpecialties', {
      vetId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'Vets',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      specialtyId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'Specialties',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  /**
   * @function down
   * @description Reverts the migration by dropping all created tables.
   * @param {import('sequelize').QueryInterface} queryInterface - The Sequelize QueryInterface.
   * @param {import('sequelize').Sequelize} Sequelize - The Sequelize instance.
   * @returns {Promise<void>}
   */
  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order of creation to respect foreign key constraints
    await queryInterface.dropTable('VetSpecialties');
    await queryInterface.dropTable('Specialties');
    await queryInterface.dropTable('Vets');
    await queryInterface.dropTable('Visits');
    await queryInterface.dropTable('Pets');
    await queryInterface.dropTable('PetTypes');
    await queryInterface.dropTable('Owners');
  }
};
