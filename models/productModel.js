/**
 * @file productModel.js
 * @description This file defines the `Product` model. It acts as an abstraction layer
 * over the database, providing methods to interact with product data.
 * It uses the `db` configuration for actual data access.
 */

const db = require('../config/db'); // Import the in-memory database utility

/**
 * @class Product
 * @description Represents a Product entity with methods for data persistence (CRUD operations).
 * This class encapsulates the data structure and business logic related to products.
 */
class Product {
    /**
     * @constructor
     * @param {string} id - The unique identifier of the product.
     * @param {string} name - The name of the product.
     * @param {string} description - A detailed description of the product.
     * @param {number} price - The price of the product.
     */
    constructor(id, name, description, price) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
    }

    /**
     * @static
     * @function getAll
     * @description Retrieves all products from the database.
     * Delegates to the `db.findAll()` method.
     * @returns {Promise<Array<Product>>} A promise that resolves to an array of Product instances.
     */
    static async getAll() {
        const productsData = await db.findAll();
        // Map raw data objects to Product instances for consistency
        return productsData.map(p => new Product(p.id, p.name, p.description, p.price));
    }

    /**
     * @static
     * @function getById
     * @description Retrieves a single product by its ID from the database.
     * Delegates to the `db.findById()` method.
     * @param {string} id - The unique identifier of the product.
     * @returns {Promise<Product|null>} A promise that resolves to a Product instance
     *   if found, otherwise null.
     */
    static async getById(id) {
        const productData = await db.findById(id);
        if (productData) {
            return new Product(productData.id, productData.name, productData.description, productData.price);
        }
        return null; // Product not found
    }

    /**
     * @function save
     * @description Saves the current Product instance to the database.
     * If `this.id` exists, it attempts to update an existing product.
     * If `this.id` does not exist, it creates a new product.
     * @returns {Promise<Product>} A promise that resolves to the saved (or updated) Product instance.
     * @throws {Error} If product data is invalid (e.g., missing name or price).
     */
    async save() {
        // Basic validation
        if (!this.name || this.price === undefined || this.price < 0) {
            throw new Error('Product name and a non-negative price are required.');
        }

        let savedProductData;
        if (this.id) {
            // If ID exists, attempt to update
            savedProductData = await db.update(this.id, {
                name: this.name,
                description: this.description,
                price: this.price
            });
            if (!savedProductData) {
                // If update failed (e.g., product not found), we might want to throw or handle differently
                throw new Error(`Product with ID ${this.id} not found for update.`);
            }
        } else {
            // If no ID, create a new product
            savedProductData = await db.save({
                name: this.name,
                description: this.description,
                price: this.price
            });
        }
        // Update the current instance's ID if it was newly created
        this.id = savedProductData.id;
        return this; // Return the current instance, now with updated ID if new
    }

    /**
     * @static
     * @function deleteById
     * @description Deletes a product by its ID from the database.
     * Delegates to the `db.deleteById()` method.
     * @param {string} id - The unique identifier of the product to delete.
     * @returns {Promise<boolean>} A promise that resolves to true if the product was
     *   successfully deleted, otherwise false.
     */
    static async deleteById(id) {
        return await db.deleteById(id);
    }
}

module.exports = Product;
