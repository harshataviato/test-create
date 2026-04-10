/**
 * @fileoverview Sequelize model definition for the 'Item' entity.
 * This file defines the structure (schema) and behavior of an Item in the database.
 */

/**
 * Defines the Item model.
 * @param {object} sequelize - The Sequelize instance.
 * @param {object} DataTypes - The Sequelize DataTypes object, used to define column types.
 * @returns {object} The defined Item model.
 */
module.exports = (sequelize, DataTypes) => {
  /**
   * Represents an Item in the database.
   * An item has a name, description, and price.
   * @class Item
   * @extends {Sequelize.Model}
   */
  const Item = sequelize.define('Item', {
    /**
     * Primary key for the Item.
     * Automatically increments and is unique.
     * @type {number}
     */
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    /**
     * The name of the item.
     * Must be a string and cannot be null.
     * @type {string}
     */
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Item name cannot be empty."
        },
        len: {
          args: [2, 100], // Name must be between 2 and 100 characters long
          msg: "Item name must be between 2 and 100 characters."
        }
      }
    },
    /**
     * A detailed description of the item.
     * Can be a longer text string.
     * @type {string}
     */
    description: {
      type: DataTypes.TEXT,
      allowNull: true // Description is optional
    },
    /**
     * The price of the item.
     * Stored as a DECIMAL to ensure precision for currency values.
     * Cannot be null and must be a positive number.
     * @type {number}
     */
    price: {
      type: DataTypes.DECIMAL(10, 2), // 10 total digits, 2 after decimal point
      allowNull: false,
      validate: {
        isDecimal: {
          msg: "Price must be a valid decimal number."
        },
        min: {
          args: [0.01], // Price must be at least 0.01
          msg: "Price must be a positive number."
        }
      }
    }
  }, {
    // Model options
    tableName: 'Items', // Explicitly define the table name
    timestamps: true // Add createdAt and updatedAt columns automatically
  });

  /**
   * Defines associations for the Item model.
   * Currently, no associations are defined for this simple model.
   * @param {object} models - An object containing all initialized models.
   * @returns {void}
   */
  Item.associate = function(models) {
    // Define associations here if any, e.g., Item.hasMany(models.Order);
  };

  return Item;
};
