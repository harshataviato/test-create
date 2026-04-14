/**
 * @file models/specialty.js
 * @description Specialty model, extends `NamedEntity`. Represents a vet's specialty.
 * Mimics Spring PetClinic's `Specialty.java`.
 */

const { DataTypes } = require('sequelize');
const NamedEntity = require('./namedEntity');

/**
 * @class Specialty
 * @extends NamedEntity
 * @description Sequelize model representing a veterinarian's specialty (e.g., dentistry, surgery).
 * Extends `NamedEntity` to include `id` and `name` properties.
 */
class Specialty extends NamedEntity {
  /**
   * @method initialize
   * @description Initializes the Specialty model with schema definition.
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
          type: DataTypes.STRING(80),
          allowNull: false,
          unique: true, // Specialty names should be unique
        },
      },
      {
        sequelize,
        modelName: 'Specialty',
        tableName: 'specialties',
        timestamps: false,
        underscored: true,
        indexes: [
          {
            fields: ['name'], // Index for faster lookup by name
          },
        ],
      }
    );
  }
}

module.exports = Specialty;
