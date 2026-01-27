/**
 * @fileoverview Sequelize model definition for PetType.
 * This model extends `NamedEntity` and represents different types of pets (e.g., Cat, Dog).
 * It mimics the `PetType.java` class.
 */

const { DataTypes } = require('sequelize');
const NamedEntityModel = require('./NamedEntity'); // Import the NamedEntity definition

/**
 * @class PetType
 * @extends NamedEntity
 * @description Models a Pet's type (e.g., Cat, Dog, Hamster).
 * @param {Sequelize} sequelize - The Sequelize instance.
 * @param {DataTypes} DataTypes - The Sequelize data types.
 * @returns {Model} The PetType Sequelize model.
 */
module.exports = (sequelize, DataTypes) => {
  const NamedEntity = NamedEntityModel(sequelize, DataTypes); // Initialize NamedEntity for extension

  class PetType extends NamedEntity {
    // Custom methods or getters/setters can be added here
  }

  PetType.init(
    {
      // Inherits 'id', 'name' from NamedEntity
    },
    {
      sequelize,
      modelName: 'PetType',
      tableName: 'types', // Explicit table name
      timestamps: false, // Disable createdAt and updatedAt
      getterMethods: {
        ...NamedEntity.prototype.getterMethods, // Inherit isNew and toString from NamedEntity
      }
    }
  );

  return PetType;
};
