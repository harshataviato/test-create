/**
 * @file models/owner.js
 * @description Owner model extending `Person` with address, city, telephone, and pets.
 * Mimics Spring PetClinic's `Owner.java`.
 */

const { DataTypes } = require('sequelize');
const Person = require('./person');
const Pet = require('./pet'); // Import Pet for type hinting and association

/**
 * @class Owner
 * @extends Person
 * @description Sequelize model representing an owner in the pet clinic.
 * Extends the `Person` model to include personal details like name, address, city, and telephone.
 * It also manages a collection of pets associated with this owner.
 */
class Owner extends Person {
  /**
   * @method initialize
   * @description Initializes the Owner model with schema definition.
   * @param {Sequelize} sequelize - The Sequelize instance.
   */
  static initialize(sequelize) {
    // Call the parent's initialize method to inherit base properties (like ID)
    // We define ID again here to set it as primaryKey directly on the table.
    // firstName and lastName are also directly defined here, mimicking inheritance
    // as Sequelize doesn't have explicit inheritance for model definitions.
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
          field: 'first_name', // Map to snake_case column name in DB
        },
        lastName: {
          type: DataTypes.STRING(30),
          allowNull: false,
          field: 'last_name', // Map to snake_case column name in DB
        },
        address: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        city: {
          type: DataTypes.STRING(80),
          allowNull: false,
        },
        telephone: {
          type: DataTypes.STRING(20),
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: 'Owner', // The name of the model
        tableName: 'owners', // Explicit table name
        timestamps: false, // Disable createdAt and updatedAt columns
        underscored: true, // Use snake_case for column names
        indexes: [
          {
            fields: ['last_name'], // Index for faster lookup by last name
          },
        ],
      }
    );
  }

  /**
   * @method addPet
   * @description Adds a pet to the owner's collection of pets.
   * This method is intended for transient pets (not yet saved or existing).
   * For existing pets, use `owner.addPet(petInstance)` with Sequelize.
   * @param {Pet} pet - The pet instance to add.
   */
  addPet(pet) {
    if (pet.isNew()) {
      // For new pets that are part of the owner object before saving
      if (!this.pets) {
        this.pets = [];
      }
      this.pets.push(pet);
    }
    // If it's not new, it implies it's already managed by the ORM or will be saved via association.
  }

  /**
   * @method getPet
   * @description Retrieves a pet by its name from the owner's collection of pets.
   * @param {string} name - The name of the pet to find.
   * @param {boolean} [ignoreNew=false] - Whether to ignore new pets (not yet saved).
   * @returns {Pet | null} The found pet, or null if no pet with the given name exists.
   */
  getPetByName(name, ignoreNew = false) {
    if (!this.pets) {
      return null;
    }
    for (const pet of this.pets) {
      const compName = pet.name;
      if (compName && compName.toLowerCase() === name.toLowerCase()) {
        if (!ignoreNew || !pet.isNew()) {
          return pet;
        }
      }
    }
    return null;
  }

  /**
   * @method getPetById
   * @description Retrieves a pet by its ID from the owner's collection of pets.
   * @param {number} id - The ID of the pet to find.
   * @returns {Pet | null} The found pet, or null if no pet with the given ID exists.
   */
  getPetById(id) {
    if (!this.pets) {
      return null;
    }
    for (const pet of this.pets) {
      if (pet.id && pet.id === id) {
        return pet;
      }
    }
    return null;
  }

  /**
   * @method addVisit
   * @description Adds a new visit to a specific pet of this owner.
   * @param {number} petId - The ID of the pet to add the visit to.
   * @param {Visit} visit - The visit instance to add.
   * @throws {Error} If `petId` or `visit` is null, or if no pet is found with the given `petId`.
   */
  addVisit(petId, visit) {
    if (!petId) {
      throw new Error('Pet identifier must not be null!');
    }
    if (!visit) {
      throw new Error('Visit must not be null!');
    }

    const pet = this.getPetById(petId);

    if (!pet) {
      throw new Error('Invalid Pet identifier!');
    }
    // Assuming pet has a `visits` association which is an array
    // When eagerly loaded with 'include: { association: 'pets', include: 'visits' }', this.pets[i].visits will be an array
    if (!pet.visits) {
      pet.visits = [];
    }
    pet.visits.push(visit);
  }

  /**
   * @method toString
   * @description Returns a string representation of the Owner object.
   * @returns {string} The string representation.
   */
  toString() {
    return `Owner(id=${this.id}, new=${this.isNew()}, lastName=${this.lastName}, firstName=${this.firstName}, address=${this.address}, city=${this.city}, telephone=${this.telephone})`;
  }
}

module.exports = Owner;
