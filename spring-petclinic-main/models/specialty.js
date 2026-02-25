/**
 * @file models/specialty.js
 * @description Sequelize model for the 'Specialty' entity.
 * This file defines the schema for the specialties table. It replaces the Specialty.java class.
 * This model extends the concept of `NamedEntity` by having a 'name' field.
 * @author Google Senior Engineer
 */

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Specialty extends Model {
    /**
     * @static
     * @function associate
     * @description Defines associations for the Specialty model.
     * A specialty can be assigned to multiple vets.
     * @param {object} models - The models object containing all defined Sequelize models.
     * @returns {void}
     */
    static associate(models) {
      // A Specialty can be part of many Vets (through the vet_specialties join table)
      Specialty.belongsToMany(models.Vet, {
        through: 'vet_specialties', // Name of the join table
        foreignKey: 'specialty_id', // Foreign key in the join table that refers to Specialty
        otherKey: 'vet_id',         // Foreign key in the join table that refers to Vet
        as: 'vets'                  // Alias for the association
      });
    }

    /**
     * @function isNew
     * @description Checks if the specialty instance is new (not yet saved to the database).
     * Mimics `BaseEntity.isNew()` from Java.
     * @returns {boolean} True if the ID is null, false otherwise.
     */
    isNew() {
      return this.id === null;
    }
  }

  // Define the Specialty model's attributes and options
  Specialty.init({
    // id column is implicitly handled by Sequelize as primaryKey, autoIncrement
    name: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: true, // Specialty names should be unique
      validate: {
        notEmpty: { msg: 'Specialty name cannot be empty.' }
      }
    }
  }, {
    sequelize,
    modelName: 'Specialty',
    tableName: 'specialties', // Explicitly specify table name to match database schema
    timestamps: true,         // Enable createdAt and updatedAt fields
    underscored: true         // Use snake_case for automatically added attributes
  });

  return Specialty;
};
