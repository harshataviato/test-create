/**
 * @fileoverview This module provides a simple in-memory data store for products.
 * It simulates a database by storing product objects in a global array.
 * Data is not persistent across server restarts.
 */

/**
 * @typedef {Object} Product
 * @property {string} id - Unique identifier for the product.
 * @property {string} name - Name of the product.
 * @property {string} description - Description of the product.
 * @property {number} price - Price of the product.
 * @property {Date} createdAt - Timestamp when the product was created.
 */

// Array to store all product objects. This acts as our in-memory database.
const products = [];
// Counter for generating unique IDs for new products.
let nextProductId = 1;

/**
 * Saves a new product to the in-memory data store.
 * Assigns a unique ID and a creation timestamp before saving.
 * @param {object} productData - An object containing product details (name, description, price).
 * @returns {Product} The newly created product object, including its ID and creation timestamp.
 */
function saveProduct(productData) {
  // Create a new product object with a unique ID and current timestamp
  const newProduct = {
    id: String(nextProductId++), // Convert to string for consistency with typical DB IDs
    ...productData,              // Spread operator to copy name, description, price
    createdAt: new Date()        // Add creation timestamp
  };
  // Add the new product to the products array
  products.push(newProduct);
  return newProduct;
}

/**
 * Retrieves all products currently stored in the in-memory data store.
 * @returns {Product[]} An array of all product objects.
 */
function getProducts() {
  // Return a shallow copy of the products array to prevent external modification of the original array
  return [...products];
}

/**
 * (Optional) Retrieves a product by its ID from the in-memory data store.
 * @param {string} id - The ID of the product to retrieve.
 * @returns {Product|undefined} The product object if found, otherwise undefined.
 */
function getProductById(id) {
  return products.find(product => product.id === id);
}

// Export the functions to be used by other modules (e.g., controllers)
module.exports = {
  saveProduct,
  getProducts,
  getProductById // Exporting for potential future use (e.g., view/edit detail)
};
