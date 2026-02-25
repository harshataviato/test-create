/**
 * @fileoverview Sequelize migration to create initial base tables:
 * `types` for PetType, `specialties` for Specialty.
 * These tables are independent and form the foundation for other entities.
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /**
   * Defines the actions to be performed when applying this migration.
   * Creates the `types` and `specialties` tables.
   * @param {object} queryInterface - The Sequelize Query Interface.
   * @param {object} Sequelize - The Sequelize object.
   * @returns {Promise<void>} A promise that resolves when the tables are created.
   */
  async up(queryInterface, Sequelize) {
    // Create the 'types' table for PetType entities
    await queryInterface.createTable('types', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(80),
        allowNull: false,
        unique: true // PetType names should be unique
      }
    }, {
      timestamps: false,
      freezeTableName: true // Prevent Sequelize from pluralizing the table name
    });

    // Create the 'specialties' table for Specialty entities
    await queryInterface.createTable('specialties', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(80),
        allowNull: false,
        unique: true // Specialty names should be unique
      }
    }, {
      timestamps: false,
      freezeTableName: true
    });
  },

  /**
   * Defines the actions to be performed when reverting this migration.
   * Drops the `types` and `specialties` tables.
   * @param {object} queryInterface - The Sequelize Query Interface.
   * @param {object} Sequelize - The Sequelize object.
   * @returns {Promise<void>} A promise that resolves when the tables are dropped.
   */
  async down(queryInterface, Sequelize) {
    // Drop the 'types' table
    await queryInterface.dropTable('types');
    // Drop the 'specialties' table
    await queryInterface.dropTable('specialties');
  }
};
