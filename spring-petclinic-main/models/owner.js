/**
 * @file models/owner.js
 * @description Sequelize model for the 'Owner' entity.
 * This file defines the schema for the owners table and its associations
 * with pets. It replaces the Owner.java class.
 * @author Google Senior Engineer
 */

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Owner extends Model {
    /**
     * @static
     * @function associate
     * @description Defines associations for the Owner model.
     * An owner can have many pets. Deleting an owner cascades to deleting their pets.
     * @param {object} models - The models object containing all defined Sequelize models.
     * @returns {void}
     */
    static associate(models) {
      // An Owner has many Pets. `onDelete: 'CASCADE'` means if an owner is deleted, their pets are also deleted.
      Owner.hasMany(models.Pet, {
        foreignKey: 'owner_id', // `owner_id` is the foreign key in the `pets` table
        as: 'pets',           // Alias for the association (used in includes)
        onDelete: 'CASCADE',
        hooks: true           // Enable hooks to ensure CASCADE works as expected
      });
    }

    /**
     * @function isNew
     * @description Checks if the owner instance is new (not yet saved to the database).
     * Mimics `BaseEntity.isNew()` from Java.
     * @returns {boolean} True if the ID is null, false otherwise.
     */
    isNew() {
      return this.id === null;
    }

    /**
     * @function getPet
     * @description Retrieves a pet by its name or ID from the owner's pets.
     * Mimics `Owner.getPet(String name)` and `Owner.getPet(Integer id)` from Java.
     * @param {string|number} identifier - The name (string) or ID (number) of the pet.
     * @param {boolean} [ignoreNew=false] - Whether to ignore new pets (pets not yet saved).
     * @returns {object|null} The Pet object if found, otherwise null.
     */
    getPet(identifier, ignoreNew = false) {
      if (!this.pets) {
        return null;
      }

      // If identifier is a number, assume it's an ID
      if (typeof identifier === 'number') {
        for (const pet of this.pets) {
          if (!pet.isNew() && pet.id === identifier) {
            return pet;
          }
        }
      }
      // If identifier is a string, assume it's a name
      else if (typeof identifier === 'string') {
        for (const pet of this.pets) {
          if (pet.name && pet.name.toLowerCase() === identifier.toLowerCase()) {
            if (!ignoreNew || !pet.isNew()) {
              return pet;
            }
          }
        }
      }
      return null;
    }

    /**
     * @function addVisit
     * @description Adds a visit to a specific pet of this owner.
     * Mimics `Owner.addVisit(Integer petId, Visit visit)` from Java.
     * @param {number} petId - The ID of the pet to add the visit to.
     * @param {object} visitData - The visit data (e.g., { date, description }).
     * @returns {Promise<object>} The created Visit object.
     * @throws {Error} If the pet with the given ID is not found.
     */
    async addVisit(petId, visitData) {
      const pet = this.getPet(petId);
      if (!pet) {
        throw new Error(`Pet with ID ${petId} not found for owner ${this.id}`);
      }
      // Assuming visitData already contains date and description
      const newVisit = await pet.createVisit(visitData);
      // Ensure the newly added visit is also reflected in the in-memory pets array
      if (!pet.visits) {
        pet.visits = [];
      }
      pet.visits.push(newVisit);
      return newVisit;
    }

  }

  // Define the Owner model's attributes and options
  Owner.init({
    // id column is implicitly handled by Sequelize as primaryKey, autoIncrement
    first_name: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'First name cannot be empty.' }
      }
    },
    last_name: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Last name cannot be empty.' }
      }
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Address cannot be empty.' }
      }
    },
    city: {
      type: DataTypes.STRING(80),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'City cannot be empty.' }
      }
    },
    telephone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Telephone cannot be empty.' },
        is: {
          args: /^\d{10}$/, // Regex for 10-digit number
          msg: 'Telephone must be a 10-digit number.'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Owner',
    tableName: 'owners', // Explicitly specify table name to match database schema
    timestamps: true,    // Enable createdAt and updatedAt fields
    underscored: true    // Use snake_case for automatically added attributes
  });

  return Owner;
};
