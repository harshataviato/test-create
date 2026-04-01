/**
 * @file src/models/pet.model.js
 * @description Defines the Pet model and its associations. This directly translates `Pet.java`.
 */

const { DataTypes } = require('sequelize');
const db = require('../config/database').getSequelize();
const { namedAttributes, addNamedMethods } = require('./named.model');
const PetType = require('./pet-type.model');
const Visit = require('./visit.model');
const moment = require('moment'); // For date formatting

/**
 * @class Pet
 * @description Represents a pet owned by an owner.
 * Extends NamedEntity and includes properties for birth date, pet type, and visits.
 */
const Pet = db.define('Pet', {
  ...namedAttributes, // Inherits id and name from NamedEntity
  birthDate: {
    type: DataTypes.DATEONLY, // DATEONLY for 'yyyy-MM-dd' format
    allowNull: true, // Can be null, validation will handle required
    field: 'birth_date', // Maps to 'birth_date' column in DB
  },
}, {
  tableName: 'pets', // Maps to the 'pets' table
  timestamps: false, // No createdAt/updatedAt columns
  underscored: true, // Use snake_case for column names
});

// Define associations
// A Pet belongs to one PetType
Pet.belongsTo(PetType, {
  foreignKey: 'type_id', // Foreign key in the 'pets' table
  as: 'type' // Alias for the association
});
PetType.hasMany(Pet, {
  foreignKey: 'type_id',
  as: 'pets'
});

// A Pet has many Visits
Pet.hasMany(Visit, {
  foreignKey: 'pet_id', // Foreign key in the 'visits' table
  as: 'visits', // Alias for the association
  onDelete: 'CASCADE' // If a pet is deleted, its visits are also deleted
});
Visit.belongsTo(Pet, {
  foreignKey: 'pet_id',
  as: 'pet'
});


/**
 * @function addPetMethods
 * @description Adds custom methods to a Sequelize model instance that uses `Pet`.
 * @param {object} instance - The Sequelize model instance.
 */
function addPetMethods(instance) {
  addNamedMethods(instance); // Add named methods (and base methods)

  /**
   * @function getBirthDateFormatted
   * @description Returns the birth date formatted as 'YYYY-MM-DD'.
   * @returns {string} The formatted birth date.
   */
  instance.getBirthDateFormatted = function() {
    return this.birthDate ? moment(this.birthDate).format('YYYY-MM-DD') : '';
  };

  /**
   * @function addVisit
   * @description Adds a visit to the pet's list of visits.
   * This is for in-memory manipulation; actual persistence requires saving the `Visit` instance.
   * @param {Visit} visit - The visit object to add.
   */
  instance.addVisit = function(visit) {
    if (!this.visits) {
      this.visits = []; // Initialize if not present
    }
    this.visits.push(visit);
  };
}

// Hook to ensure custom methods are added after an instance is found or created
Pet.afterFind((pets) => {
  if (Array.isArray(pets)) {
    pets.forEach(addPetMethods);
  } else if (pets) {
    addPetMethods(pets);
  }
});

module.exports = Pet;
