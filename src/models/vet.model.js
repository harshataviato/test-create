/**
 * @file src/models/vet.model.js
 * @description Defines the Vet model and its associations. This directly translates `Vet.java`.
 */

const { DataTypes } = require('sequelize');
const db = require('../config/database').getSequelize();
const { personAttributes, addPersonMethods } = require('./person.model');
const Specialty = require('./specialty.model');

/**
 * @class Vet
 * @description Represents a veterinarian in the PetClinic system.
 * Extends Person with first name, last name, and a set of specialties.
 */
const Vet = db.define('Vet', {
  ...personAttributes, // Inherits id, firstName, lastName from Person
}, {
  tableName: 'vets', // Maps to the 'vets' table
  timestamps: false, // No createdAt/updatedAt columns
  underscored: true, // Use snake_case for column names
});

// Define the many-to-many association with Specialty
// Vets can have multiple specialties, and specialties can be held by multiple vets.
Vet.belongsToMany(Specialty, {
  through: 'vet_specialties', // Junction table
  foreignKey: 'vet_id', // Foreign key in the junction table referencing Vet
  otherKey: 'specialty_id', // Foreign key in the junction table referencing Specialty
  as: 'specialties' // Alias for the association
});

Specialty.belongsToMany(Vet, {
  through: 'vet_specialties',
  foreignKey: 'specialty_id',
  otherKey: 'vet_id',
  as: 'vets'
});

/**
 * @function addVetMethods
 * @description Adds custom methods to a Sequelize model instance that uses `Vet`.
 * @param {object} instance - The Sequelize model instance.
 */
function addVetMethods(instance) {
  addPersonMethods(instance); // Add person methods (and base methods)

  /**
   * @function getSpecialties
   * @description Retrieves the specialties associated with this vet, sorted by name.
   * @returns {Array<Specialty>} A sorted list of specialty objects.
   */
  instance.getSpecialties = function() {
    // Sequelize automatically adds a getter for associations (e.g., getSpecialties)
    // We can rely on it and simply ensure sorting if the association is loaded.
    // If 'specialties' are already loaded into the instance, use them, otherwise they'd be undefined.
    if (this.specialties) {
      return this.specialties.sort((a, b) => a.name.localeCompare(b.name));
    }
    // If specialties are not eagerly loaded, this would return an empty array or require another query.
    // For consistency with Java, assuming eager loading or a subsequent `getSpecialties()` call via Sequelize.
    return [];
  };

  /**
   * @function getNrOfSpecialties
   * @description Returns the number of specialties for this vet.
   * @returns {number} The count of specialties.
   */
  instance.getNrOfSpecialties = function() {
    return this.specialties ? this.specialties.length : 0;
  };

  /**
   * @function addSpecialty
   * @description Adds a specialty to the vet.
   * @param {Specialty} specialty - The Specialty object to add.
   */
  instance.addSpecialty = function(specialty) {
    if (!this.specialties) {
      this.specialties = []; // Initialize if not present
    }
    this.specialties.push(specialty);
    // Note: For actual database persistence, `Vet.addSpecialty(specialty)` needs to be called on the model instance
    // and then the instance needs to be saved or the association explicitly managed by Sequelize.
    // This helper only manipulates the in-memory object.
  };
}

// Hook to ensure custom methods are added after an instance is found or created
Vet.afterFind((vets) => {
  if (Array.isArray(vets)) {
    vets.forEach(addVetMethods);
  } else if (vets) {
    addVetMethods(vets);
  }
});

module.exports = Vet;
