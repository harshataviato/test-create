/**
 * @fileoverview Sequelize model definition for Visit.
 * This model extends `BaseEntity` and includes properties for visit date and description,
 * associated with a pet. It mimics the `Visit.java` class.
 */

const { DataTypes } = require('sequelize');
const BaseEntityModel = require('./BaseEntity'); // Import the BaseEntity definition

/**
 * @class Visit
 * @extends BaseEntity
 * @description Simple JavaBean domain object representing a visit.
 * @param {Sequelize} sequelize - The Sequelize instance.
 * @param {DataTypes} DataTypes - The Sequelize data types.
 * @returns {Model} The Visit Sequelize model.
 */
module.exports = (sequelize, DataTypes) => {
  const BaseEntity = BaseEntityModel(sequelize, DataTypes); // Initialize BaseEntity for extension

  class Visit extends BaseEntity {
    /**
     * @constructor
     * @description Creates a new instance of Visit for the current date.
     * This constructor is implicitly called when creating new instances.
     * The `date` field's default value handles this.
     */
    constructor(...args) {
      super(...args);
      // Ensure date is set to now if not provided, mimicking Java constructor
      if (!this.date) {
        this.date = new Date(); // Using Date object, Sequelize will handle conversion to DATEONLY
      }
    }
  }

  Visit.init(
    {
      // Inherits 'id' from BaseEntity
      date: {
        type: DataTypes.DATEONLY, // DATEONLY for 'yyyy-MM-dd' format
        allowNull: false,
        defaultValue: DataTypes.NOW, // Sets the default to current date, mimicking Java constructor
        field: 'visit_date'
      },
      description: {
        type: DataTypes.STRING(255), // VARCHAR(255)
        allowNull: false, // @NotBlank equivalent
        validate: {
          notEmpty: true, // Ensure description is not blank
        }
      },
      // pet_id will be handled by associations
    },
    {
      sequelize,
      modelName: 'Visit',
      tableName: 'visits', // Explicit table name
      timestamps: false, // Disable createdAt and updatedAt
      getterMethods: {
        ...BaseEntity.prototype.getterMethods, // Inherit isNew from BaseEntity
      }
    }
  );

  return Visit;
};
