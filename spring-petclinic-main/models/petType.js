/**
 * @file models/petType.js
 * @description Sequelize model for the 'PetType' entity.
 * This file defines the schema for the types table. It replaces the PetType.java class.
 * This model extends the concept of `NamedEntity` by having a 'name' field.
 * @author Google Senior Engineer
 */

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PetType extends Model {
    /**
     * @static
     * @function associate
     * @description Defines associations for the PetType model.
     * A pet type can have many pets.
     * @param {object} models - The models object containing all defined Sequelize models.
     * @returns {void}
     */
    static associate(models) {
      // A PetType can have many Pets
      PetType.hasMany(models.Pet, {
        foreignKey: 'type_id',
        as: 'pets'
      });
    }

    /**
     * @function isNew
     * @description Checks if the pet type instance is new (not yet saved to the database).
     * Mimics `BaseEntity.isNew()` from Java.
     * @returns {boolean} True if the ID is null, false otherwise.
     */
    isNew() {
      return this.id === null;
    }
  }

  // Define the PetType model's attributes and options
  PetType.init({
    // id column is implicitly handled by Sequelize as primaryKey, autoIncrement
    name: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: true, // Pet type names should be unique
      validate: {
        notEmpty: { msg: 'Pet type name cannot be empty.' }
      }
    }
  }, {
    sequelize,
    modelName: 'PetType',
    tableName: 'types', // Explicitly specify table name to match database schema
    timestamps: true,   // Enable createdAt and updatedAt fields
    underscored: true   // Use snake_case for automatically added attributes
  });

  return PetType;
};
