/**
 * @file db.js
 * @description This file simulates a database connection and provides an in-memory store
 * for product data. In a real application, this would connect to a persistent database
 * (e.g., PostgreSQL, MySQL, MongoDB) using an ORM (like Sequelize, Mongoose).
 */

// Initial seed data for the in-memory store.
// This will be used to reset the 'database' state for tests.
const initialProducts = [
    { id: '1', name: 'Laptop', description: 'Powerful computing machine', price: 1200.00 },
    { id: '2', name: 'Mouse', description: 'Ergonomic wireless mouse', price: 25.00 },
    { id: '3', name: 'Keyboard', description: 'Mechanical RGB keyboard', price: 75.00 }
];

// The actual array storing product objects, simulating a database table.
// This data is volatile and will be reset every time the server restarts or 'db.reset()' is called.
let products = [];

// A simple counter to generate unique IDs for new products.
let nextId;

/**
 * @module db
 * @description Provides direct access methods to the in-memory product data.
 * These methods mimic basic CRUD operations on a database.
 */
const db = {
    /**
     * @function findAll
     * @description Retrieves all products from the in-memory store.
     * @returns {Promise<Array<object>>} A promise that resolves to an array of product objects (a copy).
     */
    findAll: async () => {
        // Simulate an asynchronous database operation and return a copy to prevent external modification
        return Promise.resolve([...products]);
    },

    /**
     * @function findById
     * @description Retrieves a single product by its ID.
     * @param {string} id - The unique identifier of the product.
     * @returns {Promise<object|null>} A promise that resolves to the product object
     *   if found, otherwise null.
     */
    findById: async (id) => {
        // Simulate an asynchronous database operation
        return Promise.resolve(products.find(p => p.id === id) || null);
    },

    /**
     * @function save
     * @description Saves a new product to the in-memory store.
     * Assigns a new unique ID before saving.
     * @param {object} productData - The data for the new product (e.g., name, description, price).
     * @returns {Promise<object>} A promise that resolves to the newly created product object,
     *   including its assigned ID.
     */
    save: async (productData) => {
        const newProduct = {
            id: String(nextId++), // Generate a new unique ID
            ...productData
        };
        products.push(newProduct); // Add the new product to the array
        return Promise.resolve(newProduct);
    },

    /**
     * @function update
     * @description Updates an existing product in the in-memory store.
     * @param {string} id - The unique identifier of the product to update.
     * @param {object} productData - The new data for the product (e.g., name, description, price).
     * @returns {Promise<object|null>} A promise that resolves to the updated product object
     *   if found and updated, otherwise null.
     */
    update: async (id, productData) => {
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            products[index] = { id, ...productData }; // Update the product
            return Promise.resolve(products[index]);
        }
        return Promise.resolve(null); // Product not found
    },

    /**
     * @function deleteById
     * @description Deletes a product from the in-memory store by its ID.
     * @param {string} id - The unique identifier of the product to delete.
     * @returns {Promise<boolean>} A promise that resolves to true if the product was
     *   found and deleted, otherwise false.
     */
    deleteById: async (id) => {
        const initialLength = products.length;
        // Filter out the product with the given ID
        products = products.filter(p => p.id !== id);
        // Return true if the length changed (meaning a product was deleted)
        return Promise.resolve(products.length < initialLength);
    },

    // --- Test-specific functions for managing the in-memory database state ---

    /**
     * @function reset
     * @description Resets the in-memory product store to its initial seed data.
     * This is crucial for test isolation to ensure each test runs against a clean state.
     */
    reset: () => {
        // Deep copy the initial products to ensure test modifications don't affect the original seed
        products = JSON.parse(JSON.stringify(initialProducts));
        // Recalculate nextId based on the current products array
        nextId = products.length > 0 ? Math.max(...products.map(p => parseInt(p.id))) + 1 : 1;
    },

    /**
     * @function _getProducts
     * @description (For testing purposes) Returns the current array of products.
     * @returns {Array<object>} The internal products array.
     */
    _getProducts: () => products,

    /**
     * @function _setProducts
     * @description (For testing purposes) Sets the internal products array and recalculates nextId.
     * @param {Array<object>} newProducts - The new array of products to set.
     */
    _setProducts: (newProducts) => {
        products = newProducts;
        nextId = products.length > 0 ? Math.max(...products.map(p => parseInt(p.id))) + 1 : 1;
    },

    /**
     * @function _getNextId
     * @description (For testing purposes) Returns the current nextId.
     * @returns {number} The current nextId value.
     */
    _getNextId: () => nextId,

    /**
     * @function _setNextId
     * @description (For testing purposes) Sets the nextId to a specific value.
     * @param {number} id - The new value for nextId.
     */
    _setNextId: (id) => { nextId = id; }
};

// Initialize the database with seed data when the module is first loaded.
// This prepares it for the first run or development usage.
// Tests will use `db.reset()` to ensure a clean state.
db.reset();

module.exports = db;
