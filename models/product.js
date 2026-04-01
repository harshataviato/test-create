/**
 * @module models/product
 * @description Defines the Mongoose schema and model for a Product.
 */

const mongoose = require('mongoose');

/**
 * @typedef {Object} Product
 * @property {string} name - The name of the product. Required.
 * @property {string} description - A detailed description of the product.
 * @property {number} price - The price of the product. Required, must be a positive number.
 * @property {number} quantity - The available quantity of the product. Required, must be a non-negative integer.
 * @property {Date} createdAt - The timestamp when the product was created. Automatically set.
 * @property {Date} updatedAt - The timestamp when the product was last updated. Automatically set.
 */

/**
 * Mongoose Schema for a Product.
 * This schema defines the structure and validation rules for product documents
 * stored in the MongoDB database.
 */
const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'], // Name is a required string
    trim: true, // Remove whitespace from both ends of a string
    minlength: [3, 'Product name must be at least 3 characters long'] // Minimum length for name
  },
  description: {
    type: String,
    required: false, // Description is optional
    trim: true,
    maxlength: [500, 'Product description cannot exceed 500 characters'] // Max length for description
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'], // Price is a required number
    min: [0, 'Product price cannot be negative'] // Price must be non-negative
  },
  quantity: {
    type: Number,
    required: [true, 'Product quantity is required'], // Quantity is a required number
    min: [0, 'Product quantity cannot be negative'], // Quantity must be non-negative
    default: 0 // Default quantity to 0 if not provided
  }
}, {
  timestamps: true // Automatically add `createdAt` and `updatedAt` fields
});

/**
 * Mongoose Model for Product.
 * This model provides an interface for interacting with the 'Product' collection
 * in the MongoDB database.
 */
module.exports = mongoose.model('Product', ProductSchema);
