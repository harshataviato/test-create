/**
 * @file models/vet.js
 * @description Sequelize model for the 'Vet' entity.
 * This file defines the schema for the vets table and its associations
 * with specialties. It replaces the Vet.java class.
 * This model extends the concept of `Person` (which has first and last names).
 * @author Google Senior Engineer
 */

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Vet extends Model {
    /**
     * @static
     * @function associate
     * @description Defines associations for the Vet model.
     * A vet can have many specialties (many-to-many relationship).
     * @param {object} models - The models object containing all defined Sequelize models.
     * @returns {void}
     */
    static associate(models) {
      // A Vet can have many Specialties (through the vet_specialties join table)
      Vet.belongsToMany(models.Specialty, {
        through: 'vet_specialties', // Name of the join table
        foreignKey: 'vet_id',         // Foreign key in the join table that refers to Vet
        otherKey: 'specialty_id',     // Foreign key in the join table that refers to Specialty
        as: 'specialties'             // Alias for the association (used in includes)
      });
    }

    /**
     * @function isNew
     * @description Checks if the vet instance is new (not yet saved to the database).
     * Mimics `BaseEntity.isNew()` from Java.
     * @returns {boolean} True if the ID is null, false otherwise.
     */
    isNew() {
      return this.id === null;
    }

    /**
     * @function getNrOfSpecialties
     * @description Returns the number of specialties associated with this vet.
     * Mimics `Vet.getNrOfSpecialties()` from Java.
     * @returns {number} The count of specialties.
     */
    getNrOfSpecialties() {
      return this.specialties ? this.specialties.length : 0;
    }

    /**
     * @function addSpecialty
     * @description Adds a specialty to the vet's collection of specialties.
     * This operation typically requires saving the association to the database separately
     * if the vet and specialty are already persisted.
     * @param {object} specialty - The Specialty model instance to add.
     * @returns {void}
     */
    addSpecialty(specialty) {
      if (!this.specialties) {
        this.specialties = [];
      }
      this.specialties.push(specialty);
    }
  }

  // Define the Vet model's attributes and options
  // Inherits first_name and last_name implicitly from the concept of Person
  Vet.init({
    // id column is implicitly handled by Sequelize as primaryKey, autoIncrement
    first_name: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'First name cannot be empty.' }
      }
    },
    last_name: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Last name cannot be empty.' }
      }
    }
  }, {
    sequelize,
    modelName: 'Vet',
    tableName: 'vets', // Explicitly specify table name to match database schema
    timestamps: true,  // Enable createdAt and updatedAt fields
    underscored: true  // Use snake_case for automatically added attributes
  });

  return Vet;
};
