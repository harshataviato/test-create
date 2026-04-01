/**
 * @file src/models/named.model.js
 * @description Defines the NamedEntity model, extending BaseEntity with a 'name' property.
 * This directly translates `NamedEntity.java`.
 */

const { DataTypes } = require('sequelize');
const { baseAttributes, addBaseMethods } = require('./base.model');

/**
 * @constant {object} namedAttributes
 * @description Attributes for a NamedEntity. Extends `baseAttributes` with a 'name' field.
 */
const namedAttributes = {
  ...baseAttributes, // Inherit id from BaseEntity
  name: {
    type: DataTypes.STRING(80), // VARCHAR(80)
    allowNull: false, // NOT NULL, corresponding to @NotBlank
    validate: {
      notEmpty: true, // Ensures the string is not empty
    },
  },
};

/**
 * @function addNamedMethods
 * @description Adds custom methods to a Sequelize model instance that uses `namedAttributes`.
 * @param {object} instance - The Sequelize model instance.
 */
function addNamedMethods(instance) {
  addBaseMethods(instance); // Add base methods (like isNew)
  /**
   * @function toString
   * @description Overrides the default toString method to return the entity's name.
   * @returns {string} The name of the entity, or '<null>' if name is not set.
   */
  instance.toString = function() {
    return this.name !== null && this.name !== undefined ? this.name : '<null>';
  };
}

module.exports = {
  namedAttributes,
  addNamedMethods
};
