// Import DataTypes from Sequelize, which defines the data types for model attributes
const { DataTypes } = require('sequelize');

/**
 * Defines the Product model.
 * This function is designed to be called with a Sequelize instance and DataTypes.
 * @param {Sequelize} sequelize - The Sequelize instance connected to the database.
 * @param {DataTypes} DataTypes - The Sequelize DataTypes object.
 * @returns {Model} The Product model definition.
 */
module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    // Unique identifier for the product
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true, // Automatically increments for new records
      primaryKey: true,    // This column is the primary key
    },
    // Name of the product
    name: {
      type: DataTypes.STRING,
      allowNull: false,    // This field cannot be null
      unique: true,        // Product names must be unique
      validate: {
        notEmpty: true,    // Ensures the string is not empty
        len: [3, 100],     // Name length must be between 3 and 100 characters
      },
    },
    // Description of the product
    description: {
      type: DataTypes.TEXT, // Use TEXT for potentially longer strings
      allowNull: true,      // Description can be null
      validate: {
        len: [0, 500],      // Description length up to 500 characters
      },
    },
    // Price of the product
    price: {
      type: DataTypes.DECIMAL(10, 2), // DECIMAL type for monetary values (10 total digits, 2 after decimal)
      allowNull: false,             // Price cannot be null
      validate: {
        isDecimal: true,            // Ensures the value is a decimal
        min: 0,                     // Price must be non-negative
      },
    },
    // Stock quantity of the product
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,              // Default stock is 0 if not provided
      validate: {
        isInt: true,                // Ensures the value is an integer
        min: 0,                     // Stock must be non-negative
      },
    },
    // Boolean to indicate if the product is active/available
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,           // Products are active by default
    },
  }, {
    // Model options
    tableName: 'Products',        // Explicitly define table name
    timestamps: true,             // Adds `createdAt` and `updatedAt` fields automatically
    underscored: true,            // Uses snake_case for column names (e.g., created_at)
    // Optional: Add indexes for performance if needed
    indexes: [
      {
        unique: true,
        fields: ['name']
      }
    ]
  });

  return Product;
};
