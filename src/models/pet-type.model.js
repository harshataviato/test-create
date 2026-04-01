/**
 * @file src/models/pet-type.model.js
 * @description Defines the PetType model. This directly translates `PetType.java`.
 */

const db = require('../config/database').getSequelize();
const { namedAttributes, addNamedMethods } = require('./named.model');

/**
 * @class PetType
 * @description Represents a type of pet (e.g., cat, dog, bird).
 * Extends NamedEntity with a 'name' property.
 */
const PetType = db.define('PetType', {
  ...namedAttributes, // Inherits id and name from NamedEntity
}, {
  tableName: 'types', // Maps to the 'types' table
  timestamps: false, // No createdAt/updatedAt columns
  underscored: true, // Use snake_case for column names
});

// Add custom methods from NamedEntity (and thus BaseEntity) to PetType instances
PetType.afterFind((petTypes) => {
  if (Array.isArray(petTypes)) {
    petTypes.forEach(addNamedMethods);
  } else if (petTypes) {
    addNamedMethods(petTypes);
  }
});

module.exports = PetType;
