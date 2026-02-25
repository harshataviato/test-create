/**
 * @file models/visit.js
 * @description Sequelize model for the 'Visit' entity.
 * This file defines the schema for the visits table and its association with pets.
 * It replaces the Visit.java class.
 * @author Google Senior Engineer
 */

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Visit extends Model {
    /**
     * @static
     * @function associate
     * @description Defines associations for the Visit model.
     * A visit belongs to a pet.
     * @param {object} models - The models object containing all defined Sequelize models.
     * @returns {void}
     */
    static associate(models) {
      // A Visit belongs to a Pet. `foreignKey` indicates the column in the `visits` table.
      Visit.belongsTo(models.Pet, {
        foreignKey: 'pet_id',
        as: 'pet'
      });
    }

    /**
     * @function isNew
     * @description Checks if the visit instance is new (not yet saved to the database).
     * Mimics `BaseEntity.isNew()` from Java.
     * @returns {boolean} True if the ID is null, false otherwise.
     */
    isNew() {
      return this.id === null;
    }
  }

  // Define the Visit model's attributes and options
  Visit.init({
    // id column is implicitly handled by Sequelize as primaryKey, autoIncrement
    pet_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    visit_date: {
      type: DataTypes.DATEONLY, // DATEONLY to store only date without time, matching LocalDate
      allowNull: false,
      validate: {
        isDate: { msg: 'Invalid visit date format. Use YYYY-MM-DD.' },
        notEmpty: { msg: 'Visit date cannot be empty.' }
      }
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Description cannot be empty.' }
      }
    }
  }, {
    sequelize,
    modelName: 'Visit',
    tableName: 'visits', // Explicitly specify table name to match database schema
    timestamps: true,    // Enable createdAt and updatedAt fields
    underscored: true    // Use snake_case for automatically added attributes
  });

  return Visit;
};
