/**
 * @fileoverview Sequelize model definition for Owner.
 * This model extends `Person` and adds properties specific to an owner,
 * including address, city, telephone, and an association with pets.
 * It mimics the `Owner.java` class.
 */

const { DataTypes, Op } = require('sequelize');
const PersonModel = require('./Person'); // Import the Person definition
const { assert } = require('console');

/**
 * @class Owner
 * @extends Person
 * @description Simple JavaBean domain object representing an owner.
 * @param {Sequelize} sequelize - The Sequelize instance.
 * @param {DataTypes} DataTypes - The Sequelize data types.
 * @returns {Model} The Owner Sequelize model.
 */
module.exports = (sequelize, DataTypes) => {
  const Person = PersonModel(sequelize, DataTypes); // Initialize Person for extension

  class Owner extends Person {
    /**
     * @method addPet
     * @description Adds a pet to the owner's list of pets.
     * If the pet is new, it's added to the in-memory pets array.
     * Note: For persistence, you'd typically save the pet through its own model or
     * by saving the owner if cascade is configured or handled explicitly.
     * @param {Pet} pet - The pet to add.
     */
    addPet(pet) {
      // Initialize pets array if it doesn't exist
      if (!this.pets) {
        this.pets = [];
      }
      if (pet.isNew()) {
        this.pets.push(pet);
      }
    }

    /**
     * @method getPet
     * @description Returns the Pet with the given name or ID, or null if none found for this Owner.
     * @param {string|number} identifier - The name (string) or ID (number) of the pet to find.
     * @param {boolean} [ignoreNew=false] - Whether to ignore new pets (pets that are not saved yet).
     * @returns {Pet|null} The Pet with the given identifier, or null if no such Pet exists for this Owner.
     */
    getPet(identifier, ignoreNew = false) {
      if (!this.pets) return null;

      // If identifier is a number, search by ID
      if (typeof identifier === 'number') {
        for (const pet of this.pets) {
          if (!pet.isNew() && pet.id === identifier) {
            return pet;
          }
        }
      } else if (typeof identifier === 'string') {
        // If identifier is a string, search by name (case-insensitive)
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
     * @method addVisit
     * @description Adds the given Visit to the Pet with the given identifier.
     * @param {number} petId - The identifier of the Pet, must not be null.
     * @param {Visit} visit - The visit to add, must not be null.
     * @throws {Error} If petId or visit is null, or if the pet is not found.
     */
    addVisit(petId, visit) {
      if (petId === null || petId === undefined) {
        throw new Error('Pet identifier must not be null!');
      }
      if (visit === null || visit === undefined) {
        throw new Error('Visit must not be null!');
      }

      const pet = this.getPet(petId);

      if (!pet) {
        throw new Error('Invalid Pet identifier!');
      }

      if (!pet.visits) {
        pet.visits = [];
      }
      pet.visits.push(visit);
    }
  }

  Owner.init(
    {
      // Inherits 'id', 'firstName', 'lastName' from Person
      address: {
        type: DataTypes.STRING(255), // VARCHAR(255)
        allowNull: false, // @NotBlank equivalent
        validate: {
          notEmpty: true, // Ensure address is not blank
        },
        field: 'address'
      },
      city: {
        type: DataTypes.STRING(80), // VARCHAR(80)
        allowNull: false, // @NotBlank equivalent
        validate: {
          notEmpty: true, // Ensure city is not blank
        },
        field: 'city'
      },
      telephone: {
        type: DataTypes.STRING(20), // VARCHAR(20)
        allowNull: false, // @NotBlank equivalent
        validate: {
          notEmpty: true, // Ensure telephone is not blank
          is: {
            args: /^(\d{10})$/, // @Pattern(regexp = "\\d{10}") equivalent for 10 digits
            msg: 'Telephone must be a 10-digit number' // Custom error message
          }
        },
        field: 'telephone'
      }
    },
    {
      sequelize,
      modelName: 'Owner',
      tableName: 'owners', // Explicit table name
      timestamps: false, // Disable createdAt and updatedAt
      getterMethods: {
        ...Person.prototype.getterMethods, // Inherit isNew from BaseEntity via Person
        // Custom toString for debugging purposes, similar to Java's ToStringCreator
        toString() {
          return `Owner(id=${this.id}, new=${this.isNew()}, firstName=${this.firstName}, lastName=${this.lastName}, ` +
                 `address=${this.address}, city=${this.city}, telephone=${this.telephone})`;
        }
      }
    }
  );

  return Owner;
};
