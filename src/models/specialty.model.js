/**
 * @file src/models/specialty.model.js
 * @description Defines the Specialty model. This directly translates `Specialty.java`.
 */

const db = require('../config/database').getSequelize();
const { namedAttributes, addNamedMethods } = require('./named.model');

/**
 * @class Specialty
 * @description Represents a veterinarian's specialty (e.g., dentistry, radiology).
 * Extends NamedEntity with a 'name' property.
 */
const Specialty = db.define('Specialty', {
  ...namedAttributes, // Inherits id and name from NamedEntity
}, {
  tableName: 'specialties', // Maps to the 'specialties' table
  timestamps: false, // No createdAt/updatedAt columns
  underscored: true, // Use snake_case for column names
});

// Add custom methods from NamedEntity (and thus BaseEntity) to Specialty instances
Specialty.afterFind((specialties) => {
  if (Array.isArray(specialties)) {
    specialties.forEach(addNamedMethods);
  } else if (specialties) {
    addNamedMethods(specialties);
  }
});

module.exports = Specialty;
