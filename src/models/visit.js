/**
 * @file models/visit.js
 * @description Visit model extending `BaseEntity` with date and description.
 * Mimics Spring PetClinic's `Visit.java`.
 */

const { DataTypes } = require('sequelize');
const BaseEntity = require('./baseEntity');

/**
 * @class Visit
 * @extends BaseEntity
 * @description Sequelize model representing a visit to a pet.
 * Extends `BaseEntity` and includes the visit date and a description.
 */
class Visit extends BaseEntity {
  /**
   * @method initialize
   * @description Initializes the Visit model with schema definition.
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
        visitDate: {
          type: DataTypes.DATEONLY, // 'DATEONLY' for 'yyyy-MM-dd'
          allowNull: false,
          defaultValue: DataTypes.NOW, // Default to current date, mimicking Java constructor
          field: 'visit_date', // Map to snake_case column name in DB
        },
        description: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        petId: { // Foreign key for Pet association
          type: DataTypes.INTEGER,
          allowNull: true, // Can be null initially before pet is associated
          field: 'pet_id',
        },
      },
      {
        sequelize,
        modelName: 'Visit',
        tableName: 'visits',
        timestamps: false,
        underscored: true,
        indexes: [
          {
            fields: ['pet_id'], // Index for faster lookup by pet
          },
        ],
      }
    );
  }

  /**
   * @property date
   * @description Getter for `visitDate` for consistency with Java model's `getDate()`.
   * @returns {Date|string} The visit date.
   */
  get date() {
    return this.getDataValue('visitDate');
  }

  /**
   * @property date
   * @description Setter for `visitDate` for consistency with Java model's `setDate()`.
   * @param {Date|string} value - The visit date to set.
   */
  set date(value) {
    this.setDataValue('visitDate', value);
  }
}

module.exports = Visit;
