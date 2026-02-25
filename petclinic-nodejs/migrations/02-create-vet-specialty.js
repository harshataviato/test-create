/**
 * @fileoverview Sequelize migration to create tables for veterinarians and their specialties.
 * This migration creates the `vets` table and the `vet_specialties` join table.
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /**
   * Defines the actions to be performed when applying this migration.
   * Creates the `vets` and `vet_specialties` tables.
   * @param {object} queryInterface - The Sequelize Query Interface.
   * @param {object} Sequelize - The Sequelize object.
   * @returns {Promise<void>} A promise that resolves when the tables are created.
   */
  async up(queryInterface, Sequelize) {
    // Create the 'vets' table
    await queryInterface.createTable('vets', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      first_name: {
        type: Sequelize.STRING(30),
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING(30),
        allowNull: false
      }
    }, {
      timestamps: false,
      freezeTableName: true
    });

    // Create the 'vet_specialties' join table for the many-to-many relationship
    await queryInterface.createTable('vet_specialties', {
      vetId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true, // Composite primary key part 1
        field: 'vet_id',
        references: {
          model: 'vets', // References the 'vets' table
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // If a vet is deleted, their specialty associations are also deleted
      },
      specialtyId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true, // Composite primary key part 2
        field: 'specialty_id',
        references: {
          model: 'specialties', // References the 'specialties' table
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // If a specialty is deleted, its vet associations are also deleted
      }
    }, {
      timestamps: false,
      freezeTableName: true
    });
  },

  /**
   * Defines the actions to be performed when reverting this migration.
   * Drops the `vet_specialties` and `vets` tables in reverse order.
   * @param {object} queryInterface - The Sequelize Query Interface.
   * @param {object} Sequelize - The Sequelize object.
   * @returns {Promise<void>} A promise that resolves when the tables are dropped.
   */
  async down(queryInterface, Sequelize) {
    // Drop tables in reverse order due to foreign key dependencies
    await queryInterface.dropTable('vet_specialties');
    await queryInterface.dropTable('vets');
  }
};
