/**
 * @fileoverview Sequelize model definition for Person.
 * This model extends `BaseEntity` by adding `firstName` and `lastName` properties.
 * It mimics the `Person.java` class.
 */

const { DataTypes } = require('sequelize');
const BaseEntityModel = require('./BaseEntity'); // Import the BaseEntity definition

/**
 * @class Person
 * @extends BaseEntity
 * @description Simple JavaBean domain object representing a person.
 * @param {Sequelize} sequelize - The Sequelize instance.
 * @param {DataTypes} DataTypes - The Sequelize data types.
 * @returns {Model} The Person Sequelize model.
 */
module.exports = (sequelize, DataTypes) => {
  const BaseEntity = BaseEntityModel(sequelize, DataTypes); // Initialize BaseEntity for extension

  class Person extends BaseEntity {
    // Custom methods or getters/setters can be added here
  }

  Person.init(
    {
      // Inherits 'id' from BaseEntity
      firstName: {
        type: DataTypes.STRING(30), // VARCHAR(30)
        allowNull: false, // @NotBlank equivalent
        validate: {
          notEmpty: true, // Ensure first name is not blank
        },
        field: 'first_name' // Explicit column name
      },
      lastName: {
        type: DataTypes.STRING(30), // VARCHAR(30)
        allowNull: false, // @NotBlank equivalent
        validate: {
          notEmpty: true, // Ensure last name is not blank
        },
        field: 'last_name' // Explicit column name
      }
    },
    {
      sequelize,
      modelName: 'Person',
      // This is also a conceptual base model like BaseEntity,
      // it won't have its own table directly.
      // Concrete models will use these attributes.
      timestamps: false,
      getterMethods: {
        ...BaseEntity.prototype.getterMethods, // Inherit isNew
      }
    }
  );

  return Person;
};
