/**
 * @file models/pet.js
 * @description Sequelize model for the 'Pet' entity.
 * This file defines the schema for the pets table and its associations
 * with owners, pet types, and visits. It replaces the Pet.java class.
 * @author Google Senior Engineer
 */

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Pet extends Model {
    /**
     * @static
     * @function associate
     * @description Defines associations for the Pet model.
     * A pet belongs to an owner, has one pet type, and can have many visits.
     * @param {object} models - The models object containing all defined Sequelize models.
     * @returns {void}
     */
    static associate(models) {
      // A Pet belongs to an Owner. `foreignKey` indicates the column in the `pets` table.
      Pet.belongsTo(models.Owner, {
        foreignKey: 'owner_id',
        as: 'owner'
      });

      // A Pet has one PetType. `foreignKey` indicates the column in the `pets` table.
      Pet.belongsTo(models.PetType, {
        foreignKey: 'type_id',
        as: 'type'
      });

      // A Pet has many Visits. `onDelete: 'CASCADE'` means if a pet is deleted, its visits are also deleted.
      Pet.hasMany(models.Visit, {
        foreignKey: 'pet_id',
        as: 'visits',
        onDelete: 'CASCADE',
        hooks: true // Enable hooks to ensure CASCADE works as expected
      });
    }

    /**
     * @function isNew
     * @description Checks if the pet instance is new (not yet saved to the database).
     * Mimics `BaseEntity.isNew()` from Java.
     * @returns {boolean} True if the ID is null, false otherwise.
     */
    isNew() {
      return this.id === null;
    }
  }

  // Define the Pet model's attributes and options
  Pet.init({
    // id column is implicitly handled by Sequelize as primaryKey, autoIncrement
    name: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Pet name cannot be empty.' }
      }
    },
    birth_date: {
      type: DataTypes.DATEONLY, // DATEONLY to store only date without time, matching LocalDate
      allowNull: false,
      validate: {
        isDate: { msg: 'Invalid birth date format. Use YYYY-MM-DD.' },
        notEmpty: { msg: 'Birth date cannot be empty.' }
      }
    },
    type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    owner_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'Pet',
    tableName: 'pets', // Explicitly specify table name to match database schema
    timestamps: true,  // Enable createdAt and updatedAt fields
    underscored: true  // Use snake_case for automatically added attributes
  });

  return Pet;
};
