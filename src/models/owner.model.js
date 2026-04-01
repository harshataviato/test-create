/**
 * @file src/models/owner.model.js
 * @description Defines the Owner model and its associations. This directly translates `Owner.java`.
 */

const { DataTypes } = require('sequelize');
const db = require('../config/database').getSequelize();
const { personAttributes, addPersonMethods } = require('./person.model');
const Pet = require('./pet.model');
const Visit = require('./visit.model'); // Ensure Visit model is imported for owner.addVisit

/**
 * @class Owner
 * @description Represents an owner of pets in the PetClinic system.
 * Extends Person with contact details (address, city, telephone) and a list of pets.
 */
const Owner = db.define('Owner', {
  ...personAttributes, // Inherits id, firstName, lastName from Person
  address: {
    type: DataTypes.STRING(255), // VARCHAR(255)
    allowNull: false, // NOT NULL, corresponding to @NotBlank
    validate: {
      notEmpty: true, // Ensures the string is not empty
    },
  },
  city: {
    type: DataTypes.STRING(80), // VARCHAR(80)
    allowNull: false, // NOT NULL, corresponding to @NotBlank
    validate: {
      notEmpty: true, // Ensures the string is not empty
    },
  },
  telephone: {
    type: DataTypes.STRING(20), // VARCHAR(20)
    allowNull: false, // NOT NULL, corresponding to @NotBlank
    validate: {
      notEmpty: true, // Ensures the string is not empty
      is: /^\d{10}$/ // Regex for a 10-digit number, corresponding to @Pattern
    },
  },
}, {
  tableName: 'owners', // Maps to the 'owners' table
  timestamps: false, // No createdAt/updatedAt columns
  underscored: true, // Use snake_case for column names
});

// Define association: An Owner has many Pets
Owner.hasMany(Pet, {
  foreignKey: 'owner_id', // Foreign key in the 'pets' table
  as: 'pets', // Alias for the association
  onDelete: 'CASCADE' // If an owner is deleted, their pets are also deleted
});
Pet.belongsTo(Owner, {
  foreignKey: 'owner_id',
  as: 'owner'
});

/**
 * @function addOwnerMethods
 * @description Adds custom methods to a Sequelize model instance that uses `Owner`.
 * @param {object} instance - The Sequelize model instance.
 */
function addOwnerMethods(instance) {
  addPersonMethods(instance); // Add person methods (and base methods)

  /**
   * @function addPet
   * @description Adds a pet to the owner's list of pets.
   * This handles both new and existing pets in-memory.
   * @param {Pet} pet - The Pet object to add.
   */
  instance.addPet = function(pet) {
    if (!this.pets) {
      this.pets = []; // Initialize if not present
    }
    // Only add if it's a new pet or doesn't already exist by ID
    if (pet.isNew() || !this.pets.some(p => p.id === pet.id)) {
      this.pets.push(pet);
    }
  };

  /**
   * @function getPet
   * @description Retrieves a pet by its name or ID from the owner's pets.
   * @param {string|number} identifier - The name (string) or ID (number) of the pet.
   * @param {boolean} [ignoreNew=false] - If true, ignores pets that are not yet persisted.
   * @returns {Pet|null} The found Pet object, or null if not found.
   */
  instance.getPet = function(identifier, ignoreNew = false) {
    if (!this.pets) {
      return null;
    }

    if (typeof identifier === 'number') {
      // Search by ID
      for (const pet of this.pets) {
        if (!pet.isNew() && pet.id === identifier) {
          return pet;
        }
      }
    } else if (typeof identifier === 'string') {
      // Search by name (case-insensitive)
      for (const pet of this.pets) {
        if (pet.name && pet.name.toLowerCase() === identifier.toLowerCase()) {
          if (!ignoreNew || !pet.isNew()) {
            return pet;
          }
        }
      }
    }
    return null;
  };

  /**
   * @async @function addVisit
   * @description Adds the given `Visit` to the `Pet` with the given identifier and persists it.
   * @param {number} petId - The identifier of the `Pet`. Must not be null.
   * @param {Visit} visit - The visit to add. Must not be null.
   * @returns {Promise<Visit>} A promise that resolves with the created visit.
   * @throws {Error} If petId or visit are null, or if the pet is not found.
   */
  instance.addVisit = async function(petId, visit) {
    if (petId === null || petId === undefined) {
      throw new Error('Pet identifier must not be null!');
    }
    if (visit === null || visit === undefined) {
      throw new Error('Visit must not be null!');
    }

    const pet = this.getPet(petId);

    if (!pet) {
      throw new Error(`Invalid Pet identifier! Pet with id ${petId} not found for owner ${this.id}.`);
    }

    // Assign pet_id to the visit
    visit.pet_id = petId; // Directly set the foreign key

    // Save the visit to the database
    const savedVisit = await Visit.create(visit.dataValues); // `dataValues` extracts raw attributes for creation
    pet.addVisit(savedVisit); // Add the persisted visit to the in-memory pet object

    return savedVisit;
  };
}

// Hook to ensure custom methods are added after an instance is found or created
Owner.afterFind((owners) => {
  if (Array.isArray(owners)) {
    owners.forEach(addOwnerMethods);
  } else if (owners) {
    addOwnerMethods(owners);
  }
});

module.exports = Owner;
