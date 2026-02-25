/**
 * @file 002-create-owners-pets-visits.js
 * @description Sequelize migration to create `pets` and `visits` tables,
 * establishing foreign key relationships with `owners` and `types`.
 * This continues the schema definition from `schema.sql`.
 * @author Google Senior Engineer
 */

'use strict';

module.exports = {
  /**
   * @function up
   * @description Applies the migration to create the tables and their foreign keys.
   * @param {object} queryInterface - The Sequelize QueryInterface object.
   * @param {object} Sequelize - The Sequelize module.
   * @returns {Promise<void>} A promise that resolves when the tables are created.
   */
  up: async (queryInterface, Sequelize) => {
    // Create `pets` table
    await queryInterface.createTable('pets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(30),
        allowNull: false
      },
      birth_date: {
        type: Sequelize.DATEONLY, // DATEONLY to match Java's LocalDate
        allowNull: false
      },
      type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'types', // References the 'types' table
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT' // Prevent deletion of type if pets exist
      },
      owner_id: {
        type: Sequelize.INTEGER,
        allowNull: false, // Owner is required for a pet
        references: {
          model: 'owners', // References the 'owners' table
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // Deleting an owner deletes their pets
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

    // Create `visits` table
    await queryInterface.createTable('visits', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      pet_id: {
        type: Sequelize.INTEGER,
        allowNull: false, // Pet is required for a visit
        references: {
          model: 'pets', // References the 'pets' table
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // Deleting a pet deletes its visits
      },
      visit_date: {
        type: Sequelize.DATEONLY, // DATEONLY to match Java's LocalDate
        allowNull: false
      },
      description: {
        type: Sequelize.STRING(255),
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
    await queryInterface.addIndex('pets', ['name']);
    await queryInterface.addIndex('pets', ['owner_id']);
    await queryInterface.addIndex('visits', ['pet_id']);
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
    await queryInterface.dropTable('visits');
    await queryInterface.dropTable('pets');
  }
};
