/**
 * @fileoverview Sequelize model definition for Vet.
 * This model extends `Person` and includes an association with `Specialty` to represent
 * a veterinarian's specialties. It mimics the `Vet.java` class.
 */

const { DataTypes } = require('sequelize');
const PersonModel = require('./Person'); // Import the Person definition

/**
 * @class Vet
 * @extends Person
 * @description Simple JavaBean domain object representing a veterinarian.
 * @param {Sequelize} sequelize - The Sequelize instance.
 * @param {DataTypes} DataTypes - The Sequelize data types.
 * @returns {Model} The Vet Sequelize model.
 */
module.exports = (sequelize, DataTypes) => {
  const Person = PersonModel(sequelize, DataTypes); // Initialize Person for extension

  class Vet extends Person {
    /**
     * @method getSpecialties
     * @description Returns the list of specialties, sorted by name.
     * This mimics the Java `getSpecialties()` method which sorts the specialties.
     * @returns {Array<Specialty>} A sorted list of specialties.
     */
    getSpecialties() {
      // Access the associated specialties from the instance.
      // `getSpecialtiesInternal` is implicitly handled by Sequelize's getter for associated data.
      // If `this.specialties` is loaded, sort it.
      if (this.specialties && Array.isArray(this.specialties)) {
        return this.specialties.sort((a, b) => {
          const nameA = a.name ? a.name.toLowerCase() : '';
          const nameB = b.name ? b.name.toLowerCase() : '';
          if (nameA < nameB) return -1;
          if (nameA > nameB) return 1;
          return 0;
        });
      }
      return [];
    }

    /**
     * @method getNrOfSpecialties
     * @description Returns the number of specialties for the vet.
     * @returns {number} The count of specialties.
     */
    getNrOfSpecialties() {
      return this.specialties ? this.specialties.length : 0;
    }

    /**
     * @method addSpecialty
     * @description Adds a specialty to the vet's list of specialties.
     * Note: This primarily updates the in-memory array. For persistence, you'd typically
     * use Sequelize's `addSpecialty` method on the instance (e.g., `vet.addSpecialty(specialty)`).
     * @param {Specialty} specialty - The specialty to add.
     */
    addSpecialty(specialty) {
      if (!this.specialties) {
        this.specialties = [];
      }
      this.specialties.push(specialty);
    }
  }

  Vet.init(
    {
      // Inherits 'id', 'firstName', 'lastName' from Person
    },
    {
      sequelize,
      modelName: 'Vet',
      tableName: 'vets', // Explicit table name
      timestamps: false, // Disable createdAt and updatedAt
      getterMethods: {
        ...Person.prototype.getterMethods, // Inherit isNew from BaseEntity via Person
        getSpecialties: Vet.prototype.getSpecialties, // Make getSpecialties accessible via instance
        getNrOfSpecialties: Vet.prototype.getNrOfSpecialties // Make getNrOfSpecialties accessible via instance
      }
    }
  );

  return Vet;
};
