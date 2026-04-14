/**
 * @file models/pet.js
 * @description Pet model extending `NamedEntity` with birth date, type, and visits.
 * Mimics Spring PetClinic's `Pet.java`.
 */

const { DataTypes } = require('sequelize');
const NamedEntity = require('./namedEntity');

/**
 * @class Pet
 * @extends NamedEntity
 * @description Sequelize model representing a pet.
 * Extends `NamedEntity` and includes birth date, pet type, and a collection of visits.
 */
class Pet extends NamedEntity {
  /**
   * @method initialize
   * @description Initializes the Pet model with schema definition.
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
        name: {
          type: DataTypes.STRING(30),
          allowNull: false,
        },
        birthDate: {
          type: DataTypes.DATEONLY, // 'DATEONLY' for 'yyyy-MM-dd'
          allowNull: true, // Spring's @DateTimeFormat allows null initially
          field: 'birth_date', // Map to snake_case column name in DB
        },
        ownerId: { // Foreign key for Owner association
          type: DataTypes.INTEGER,
          allowNull: true, // Can be null during form submission before owner is set
          field: 'owner_id',
        },
        typeId: { // Foreign key for PetType association
          type: DataTypes.INTEGER,
          allowNull: false, // PetType is required
          field: 'type_id',
        },
      },
      {
        sequelize,
        modelName: 'Pet',
        tableName: 'pets',
        timestamps: false,
        underscored: true,
        indexes: [
          {
            fields: ['name'], // Index for faster lookup by name
          },
          {
            fields: ['owner_id'], // Index for faster lookup by owner
          }
        ],
      }
    );
  }

  /**
   * @property birthDate
   * @description The birth date of the pet.
   * @type {Date|string}
   */
  get birthDate() {
    // Sequelize returns Date objects for DATEONLY. Format as string if needed.
    return this.getDataValue('birthDate');
  }

  set birthDate(value) {
    this.setDataValue('birthDate', value);
  }

  /**
   * @property type
   * @description The type of the pet (e.g., Cat, Dog). This is an associated object.
   * @type {PetType}
   */
  // The `type` property is managed by Sequelize association.
  // It will be accessible if the `type` association is eager loaded.

  /**
   * @property visits
   * @description The collection of visits for this pet. This is an associated object.
   * @type {Visit[]}
   */
  // The `visits` property is managed by Sequelize association.
  // It will be accessible if the `visits` association is eager loaded.

  /**
   * @method addVisit
   * @description Adds a visit to the pet's collection of visits.
   * This method is primarily for transient visits (not yet saved or existing).
   * For existing visits, use `pet.addVisit(visitInstance)` with Sequelize.
   * @param {Visit} visit - The visit instance to add.
   */
  addVisit(visit) {
    if (!this.visits) {
      this.visits = [];
    }
    this.visits.push(visit);
  }
}

module.exports = Pet;
