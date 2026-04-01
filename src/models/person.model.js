/**
 * @file src/models/person.model.js
 * @description Defines the Person model, extending BaseEntity with 'firstName' and 'lastName' properties.
 * This directly translates `Person.java`.
 */

const { DataTypes } = require('sequelize');
const { baseAttributes, addBaseMethods } = require('./base.model');

/**
 * @constant {object} personAttributes
 * @description Attributes for a Person. Extends `baseAttributes` with first and last name fields.
 */
const personAttributes = {
  ...baseAttributes, // Inherit id from BaseEntity
  firstName: {
    type: DataTypes.STRING(30), // VARCHAR(30)
    allowNull: false, // NOT NULL, corresponding to @NotBlank
    field: 'first_name', // Maps to 'first_name' column in DB
    validate: {
      notEmpty: true, // Ensures the string is not empty
    },
  },
  lastName: {
    type: DataTypes.STRING(30), // VARCHAR(30)
    allowNull: false, // NOT NULL, corresponding to @NotBlank
    field: 'last_name', // Maps to 'last_name' column in DB
    validate: {
      notEmpty: true, // Ensures the string is not empty
    },
  },
};

/**
 * @function addPersonMethods
 * @description Adds custom methods to a Sequelize model instance that uses `personAttributes`.
 * @param {object} instance - The Sequelize model instance.
 */
function addPersonMethods(instance) {
  addBaseMethods(instance); // Add base methods (like isNew)
}

module.exports = {
  personAttributes,
  addPersonMethods
};
