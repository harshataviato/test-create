/**
 * @file src/models/base.model.js
 * @description Defines the BaseEntity model, providing common properties like 'id' for other models.
 * This directly translates `BaseEntity.java`.
 */

const { DataTypes } = require('sequelize');
const db = require('../config/database').getSequelize();

/**
 * @class BaseEntity
 * @description Simple Sequelize model with an auto-incrementing 'id' property.
 * Other models needing this property will extend it.
 */
const BaseEntity = db.define('BaseEntity', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
}, {
  // Configuration options for the model
  timestamps: false, // No createdAt/updatedAt columns
  underscored: true, // Use snake_case for column names
  // This model is meant to be extended, so it's abstract in a sense
  // We don't want a 'BaseEntities' table, but rather its properties integrated into extending models.
  // Sequelize doesn't have a direct "MappedSuperclass" equivalent for standalone models
  // The common properties are defined here and manually included in other models.
});

/**
 * @function isNew
 * @description Helper method to check if an entity is new (i.e., not yet saved to the database).
 * @returns {boolean} True if the entity's ID is null, false otherwise.
 */
BaseEntity.prototype.isNew = function() {
  return this.id === null || this.id === undefined;
};

// Export the base properties and helper for other models to include.
// In Sequelize, this pattern is often handled by mixing in common attributes or
// explicitly defining them in each model. For a clearer mapping, we'll expose
// an object with the common attributes and a utility to add the `isNew` method.
module.exports = {
  baseAttributes: {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
  },
  addBaseMethods: (instance) => {
    instance.isNew = function() {
      return this.id === null || this.id === undefined;
    };
  }
};
