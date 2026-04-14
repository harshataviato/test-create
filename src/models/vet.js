/**
 * @file models/vet.js
 * @description Vet model extending `Person` with a collection of specialties.
 * Mimics Spring PetClinic's `Vet.java`.
 */

const { DataTypes } = require('sequelize');
const Person = require('./person');
const Specialty = require('./specialty'); // Import Specialty for type hinting and association

/**
 * @class Vet
 * @extends Person
 * @description Sequelize model representing a veterinarian in the pet clinic.
 * Extends the `Person` model to include personal details and a many-to-many relationship with `Specialty`.
 */
class Vet extends Person {
  /**
   * @method initialize
   * @description Initializes the Vet model with schema definition.
   * @param {Sequelize} sequelize - The Sequelize instance.
   */
  static initialize(sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        firstName: {
          type: DataTypes.STRING(30),
          allowNull: false,
          field: 'first_name',
        },
        lastName: {
          type: DataTypes.STRING(30),
          allowNull: false,
          field: 'last_name',
        },
      },
      {
        sequelize,
        modelName: 'Vet',
        tableName: 'vets',
        timestamps: false,
        underscored: true,
        indexes: [
          {
            fields: ['last_name'],
          },
        ],
      }
    );
  }

  /**
   * @method getSpecialties
   * @description Retrieves the specialties of the vet, sorted by name.
   * This getter assumes that `specialties` are eagerly loaded through an association.
   * @returns {Specialty[]} An array of specialty objects, sorted by name.
   */
  getSpecialties() {
    // When the 'specialties' association is included, it will be available as 'this.specialties'.
    if (this.specialties && Array.isArray(this.specialties)) {
      return this.specialties.sort((a, b) => a.name.localeCompare(b.name));
    }
    return [];
  }

  /**
   * @method getNrOfSpecialties
   * @description Returns the number of specialties associated with this vet.
   * @returns {number} The count of specialties.
   */
  getNrOfSpecialties() {
    return this.getSpecialties().length;
  }

  /**
   * @method addSpecialty
   * @description Adds a specialty to the vet's collection of specialties.
   * This is for when manually managing the collection before saving via association.
   * @param {Specialty} specialty - The specialty instance to add.
   */
  addSpecialty(specialty) {
    if (!this.specialties) {
      this.specialties = [];
    }
    this.specialties.push(specialty);
  }
}

module.exports = Vet;
