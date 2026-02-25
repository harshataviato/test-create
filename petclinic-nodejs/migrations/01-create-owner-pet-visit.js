/**
 * @fileoverview Sequelize migration to create tables related to owners, pets, and visits.
 * This migration depends on `00-create-base-entities.js` for the `types` table.
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /**
   * Defines the actions to be performed when applying this migration.
   * Creates the `owners`, `pets`, and `visits` tables, including foreign key constraints.
   * @param {object} queryInterface - The Sequelize Query Interface.
   * @param {object} Sequelize - The Sequelize object.
   * @returns {Promise<void>} A promise that resolves when the tables are created.
   */
  async up(queryInterface, Sequelize) {
    // Create the 'owners' table
    await queryInterface.createTable('owners', {
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
      }
    }, {
      timestamps: false,
      freezeTableName: true
    });

    // Create the 'pets' table
    await queryInterface.createTable('pets', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(30),
        allowNull: false
      },
      birth_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'types', // References the 'types' table
          key: 'id'
        },
        onUpdate: 'CASCADE', // Update foreign key if referenced primary key changes
        onDelete: 'RESTRICT' // Prevent deletion of referenced type if pets exist
      },
      owner_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'owners', // References the 'owners' table
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // If an owner is deleted, their pets are also deleted
      }
    }, {
      timestamps: false,
      freezeTableName: true
    });

    // Create the 'visits' table
    await queryInterface.createTable('visits', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      visit_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      pet_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'pets', // References the 'pets' table
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // If a pet is deleted, its visits are also deleted
      }
    }, {
      timestamps: false,
      freezeTableName: true
    });
  },

  /**
   * Defines the actions to be performed when reverting this migration.
   * Drops the `visits`, `pets`, and `owners` tables in reverse order of creation
   * to respect foreign key constraints.
   * @param {object} queryInterface - The Sequelize Query Interface.
   * @param {object} Sequelize - The Sequelize object.
   * @returns {Promise<void>} A promise that resolves when the tables are dropped.
   */
  async down(queryInterface, Sequelize) {
    // Drop tables in reverse order due to foreign key dependencies
    await queryInterface.dropTable('visits');
    await queryInterface.dropTable('pets');
    await queryInterface.dropTable('owners');
  }
};
