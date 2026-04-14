/**
 * @file models/petType.js
 * @description PetType model, extends `NamedEntity`. Represents types of pets like Cat, Dog, etc.
 * Mimics Spring PetClinic's `PetType.java`.
 */

const { DataTypes } = require('sequelize');
const NamedEntity = require('./namedEntity');

/**
 * @class PetType
 * @extends NamedEntity
 * @description Sequelize model representing a type of pet (e.g., 'cat', 'dog').
 * Extends the `NamedEntity` model, inheriting the `id` and `name` properties.
 */
class PetType extends NamedEntity {
  /**
   * @method initialize
   * @description Initializes the PetType model with schema definition.
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
          unique: true, // Pet types should be unique
        },
      },
      {
        sequelize,
        modelName: 'PetType',
        tableName: 'types', // The original database table name
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

module.exports = PetType;
