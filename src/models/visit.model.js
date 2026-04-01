/**
 * @file src/models/visit.model.js
 * @description Defines the Visit model. This directly translates `Visit.java`.
 */

const { DataTypes } = require('sequelize');
const db = require('../config/database').getSequelize();
const { baseAttributes, addBaseMethods } = require('./base.model');
const moment = require('moment'); // For date formatting

/**
 * @class Visit
 * @description Represents a visit made by a pet to the clinic.
 * Extends BaseEntity and includes properties for visit date and description.
 */
const Visit = db.define('Visit', {
  ...baseAttributes, // Inherits id from BaseEntity
  date: {
    type: DataTypes.DATEONLY, // DATEONLY for 'yyyy-MM-dd' format
    allowNull: true, // Can be null, validation will handle required
    field: 'visit_date', // Maps to 'visit_date' column in DB
    defaultValue: DataTypes.NOW, // Default to current date if not provided
  },
  description: {
    type: DataTypes.STRING(255), // VARCHAR(255)
    allowNull: false, // NOT NULL, corresponding to @NotBlank
    validate: {
      notEmpty: true, // Ensures the string is not empty
    },
  },
}, {
  tableName: 'visits', // Maps to the 'visits' table
  timestamps: false, // No createdAt/updatedAt columns
  underscored: true, // Use snake_case for column names
});

/**
 * @function addVisitMethods
 * @description Adds custom methods to a Sequelize model instance that uses `Visit`.
 * @param {object} instance - The Sequelize model instance.
 */
function addVisitMethods(instance) {
  addBaseMethods(instance); // Add base methods (like isNew)

  /**
   * @function getDateFormatted
   * @description Returns the visit date formatted as 'YYYY-MM-DD'.
   * @returns {string} The formatted visit date.
   */
  instance.getDateFormatted = function() {
    return this.date ? moment(this.date).format('YYYY-MM-DD') : '';
  };
}

// Hook to ensure custom methods are added after an instance is found or created
Visit.afterFind((visits) => {
  if (Array.isArray(visits)) {
    visits.forEach(addVisitMethods);
  } else if (visits) {
    addVisitMethods(visits);
  }
});

module.exports = Visit;
