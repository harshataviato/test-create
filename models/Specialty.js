/**
 * @fileoverview Sequelize model definition for Specialty.
 * This model extends `NamedEntity` and represents a vet's specialty (e.g., dentistry).
 * It mimics the `Specialty.java` class.
 */

const { DataTypes } = require('sequelize');
const NamedEntityModel = require('./NamedEntity'); // Import the NamedEntity definition

/**
 * @class Specialty
 * @extends NamedEntity
 * @description Models a Vet's specialty (for example, dentistry).
 * @param {Sequelize} sequelize - The Sequelize instance.
 * @param {DataTypes} DataTypes - The Sequelize data types.
 * @returns {Model} The Specialty Sequelize model.
 */
module.exports = (sequelize, DataTypes) => {
  const NamedEntity = NamedEntityModel(sequelize, DataTypes); // Initialize NamedEntity for extension

  class Specialty extends NamedEntity {
    // Custom methods or getters/setters can be added here
  }

  Specialty.init(
    {
      // Inherits 'id', 'name' from NamedEntity
    },
    {
      sequelize,
      modelName: 'Specialty',
      tableName: 'specialties', // Explicit table name
      timestamps: false, // Disable createdAt and updatedAt
      getterMethods: {
        ...NamedEntity.prototype.getterMethods, // Inherit isNew and toString from NamedEntity
      }
    }
  );

  return Specialty;
};
