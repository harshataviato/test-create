/**
 * @fileoverview Sequelize model definition for NamedEntity.
 * This model extends `BaseEntity` by adding a `name` property.
 * It mimics the `NamedEntity.java` class.
 */

const { DataTypes } = require('sequelize');
const BaseEntityModel = require('./BaseEntity'); // Import the BaseEntity definition

/**
 * @class NamedEntity
 * @extends BaseEntity
 * @description Simple JavaBean domain object adds a name property to BaseEntity. Used as a base class for objects
 * needing these properties.
 * @param {Sequelize} sequelize - The Sequelize instance.
 * @param {DataTypes} DataTypes - The Sequelize data types.
 * @returns {Model} The NamedEntity Sequelize model.
 */
module.exports = (sequelize, DataTypes) => {
  const BaseEntity = BaseEntityModel(sequelize, DataTypes); // Initialize BaseEntity for extension

  class NamedEntity extends BaseEntity {
    /**
     * @method toString
     * @description Returns the name of the entity, or '<null>' if name is not set.
     * @returns {string} The name of the entity.
     */
    toString() {
      return this.name ? this.name : '<null>';
    }
  }

  NamedEntity.init(
    {
      // Inherits 'id' from BaseEntity
      name: {
        type: DataTypes.STRING(80), // VARCHAR(80)
        allowNull: false, // @NotBlank equivalent
        validate: {
          notEmpty: true, // Ensure name is not blank
        },
        field: 'name' // Explicit column name if different from attribute name
      }
    },
    {
      sequelize,
      modelName: 'NamedEntity',
      // This is also a conceptual base model like BaseEntity,
      // it won't have its own table directly.
      // Concrete models will use these attributes.
      timestamps: false,
      getterMethods: {
        ...BaseEntity.prototype.getterMethods, // Inherit isNew
        toString() {
          return this.name ? this.name : '<null>';
        }
      }
    }
  );

  return NamedEntity;
};
