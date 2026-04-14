/**
 * @file db/migrations/20231122000000-initial-schema.js
 * @description Sequelize migration for creating the initial database schema
 * for the Node.js PetClinic application.
 * This migration closely mirrors the `schema.sql` files from the Java version.
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /**
   * @method up
   * @description Applies the migrations, creating tables and associations.
   * @param {import('sequelize').QueryInterface} queryInterface - Sequelize query interface.
   * @param {import('sequelize')} Sequelize - Sequelize library.
   */
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('vets', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      first_name: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      last_name: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
    });
    await queryInterface.addIndex('vets', ['last_name'], { name: 'vets_last_name' });

    await queryInterface.createTable('specialties', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(80),
        allowNull: false,
        unique: true,
      },
    });
    await queryInterface.addIndex('specialties', ['name'], { name: 'specialties_name' });

    await queryInterface.createTable('vet_specialties', {
      vet_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'vets',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      specialty_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'specialties',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    });
    await queryInterface.addConstraint('vet_specialties', {
      fields: ['vet_id', 'specialty_id'],
      type: 'unique',
      name: 'vet_specialties_vet_id_specialty_id_uk',
    });

    await queryInterface.createTable('types', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(80),
        allowNull: false,
        unique: true,
      },
    });
    await queryInterface.addIndex('types', ['name'], { name: 'types_name' });

    await queryInterface.createTable('owners', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      first_name: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      last_name: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      address: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      city: {
        type: Sequelize.STRING(80),
        allowNull: false,
      },
      telephone: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
    });
    await queryInterface.addIndex('owners', ['last_name'], { name: 'owners_last_name' });

    await queryInterface.createTable('pets', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      birth_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'types',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT', // Prevent deleting pet types if pets exist
      },
      owner_id: {
        type: Sequelize.INTEGER,
        allowNull: true, // Can be null initially or if not strictly enforced
        references: {
          model: 'owners',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    });
    await queryInterface.addIndex('pets', ['name'], { name: 'pets_name' });
    await queryInterface.addIndex('pets', ['owner_id'], { name: 'pets_owner_id' });


    await queryInterface.createTable('visits', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      pet_id: {
        type: Sequelize.INTEGER,
        allowNull: true, // Can be null initially or if not strictly enforced
        references: {
          model: 'pets',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      visit_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
    });
    await queryInterface.addIndex('visits', ['pet_id'], { name: 'visits_pet_id' });

  },

  /**
   * @method down
   * @description Reverts the migrations, dropping tables in reverse order of creation.
   * @param {import('sequelize').QueryInterface} queryInterface - Sequelize query interface.
   * @param {import('sequelize')} Sequelize - Sequelize library.
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
