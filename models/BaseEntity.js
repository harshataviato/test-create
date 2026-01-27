/**
 * @fileoverview Sequelize model definition for BaseEntity.
 * This model serves as a base class for other entities, providing a common `id` property.
 * It mimics the `BaseEntity.java` class, including an auto-incrementing primary key.
 * `MappedSuperclass` equivalent is handled by defining common attributes in the base model
 * and then extending it using JavaScript class inheritance or composition.
 */

const { Model, DataTypes } = require('sequelize');

/**
 * @class BaseEntity
 * @extends Model
 * @description Simple JavaBean domain object with an id property. Used as a base class for objects
 * needing this property. In Sequelize, this is achieved by defining common attributes
 * and then having other models inherit or extend from this definition.
 * @param {Sequelize} sequelize - The Sequelize instance.
 * @param {DataTypes} DataTypes - The Sequelize data types.
 * @returns {Model} The BaseEntity Sequelize model.
 */
module.exports = (sequelize, DataTypes) => {
  class BaseEntity extends Model {
    /**
     * @static
     * @method isNew
     * @description Checks if the entity is new (i.e., its ID is null).
     * @returns {boolean} True if the entity is new, false otherwise.
     */
    isNew() {
      return this.id === null || this.id === undefined;
    }
  }

  BaseEntity.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'BaseEntity',
      // Since this is a base entity, it won't directly map to a table.
      // This is a conceptual base for other models.
      // Concrete models will have their own table names.
      // `tableName: 'base_entities',` // This table won't exist
      // `freezeTableName: true,`
      timestamps: false, // BaseEntity doesn't need timestamps
      // Set the `getterMethods` to make `isNew` available on instances
      getterMethods: {
        isNew() {
          return this.id === null || this.id === undefined;
        }
      }
    }
  );

  return BaseEntity;
};
