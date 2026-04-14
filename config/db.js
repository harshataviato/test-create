/**
 * @file db.js
 * @description This file simulates a database connection and provides an in-memory store
 * for product data. In a real application, this would connect to a persistent database
 * (e.g., PostgreSQL, MySQL, MongoDB) using an ORM (like Sequelize, Mongoose).
 */

// An array to store product objects, simulating a database table.
// This data is volatile and will be reset every time the server restarts.
let products = [
    { id: '1', name: 'Laptop', description: 'Powerful computing machine', price: 1200.00 },
    { id: '2', name: 'Mouse', description: 'Ergonomic wireless mouse', price: 25.00 },
    { id: '3', name: 'Keyboard', description: 'Mechanical RGB keyboard', price: 75.00 }
];

// A simple counter to generate unique IDs for new products.
// In a real database, this would be handled by auto-incrementing primary keys.
let nextId = products.length > 0 ? Math.max(...products.map(p => parseInt(p.id))) + 1 : 1;

/**
 * @module db
 * @description Provides direct access methods to the in-memory product data.
 * These methods mimic basic CRUD operations on a database.
 */
const db = {
    /**
     * @function findAll
     * @description Retrieves all products from the in-memory store.
     * @returns {Promise<Array<object>>} A promise that resolves to an array of product objects.
     */
    findAll: async () => {
        // Simulate an asynchronous database operation
        return Promise.resolve(products);
    },

    /**
     * @function findById
     * @description Retrieves a single product by its ID.
     * @param {string} id - The unique identifier of the product.
     * @returns {Promise<object|undefined>} A promise that resolves to the product object
     *   if found, otherwise undefined.
     */
    findById: async (id) => {
        // Simulate an asynchronous database operation
        return Promise.resolve(products.find(p => p.id === id));
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
    }
};

module.exports = db;
