/**
 * @file models/baseEntity.js
 * @description Base model for entities with an auto-incrementing ID.
 * Mimics Spring PetClinic's `BaseEntity.java`.
 */

const { Model, DataTypes } = require('sequelize');

/**
 * @class BaseEntity
 * @extends Model
 * @description Sequelize model for a base entity with an auto-incrementing ID.
 * Provides `id` and `isNew` functionality.
 */
class BaseEntity extends Model {
  /**
   * @method initialize
   * @description Initializes the BaseEntity model with schema definition.
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
      },
      {
        sequelize,
        // options for BaseEntity
        timestamps: false, // No createdAt/updatedAt for base entity directly
        underscored: true,
      }
    );
  }

  /**
   * @method isNew
   * @description Checks if the entity is new (i.e., has not been saved to the database yet).
   * @returns {boolean} True if the ID is null, false otherwise.
   */
  isNew() {
    return this.id === null || this.id === undefined;
  }
}

module.exports = BaseEntity;
