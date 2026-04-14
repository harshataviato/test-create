/**
 * @file productService.js
 * @description This file defines the `ProductService` which encapsulates business logic
 * related to products. It acts as an intermediary between the controller and the model,
 * performing operations like validation, data transformation, and orchestrating
 * multiple model interactions if needed.
 */

const Product = require('../models/productModel'); // Import the Product model

/**
 * @module productService
 * @description Provides a set of functions for product-related business operations.
 */
const productService = {

    /**
     * @function getAllProducts
     * @description Retrieves all products, applying any necessary business rules
     * or data transformations before returning.
     * @returns {Promise<Array<object>>} A promise that resolves to an array of product objects.
     */
    async getAllProducts() {
        // In a more complex app, you might apply filtering, sorting, or pagination here.
        const products = await Product.getAll();
        return products;
    },

    /**
     * @function getProductById
     * @description Retrieves a single product by its ID.
     * @param {string} id - The unique identifier of the product.
     * @returns {Promise<object|null>} A promise that resolves to the product object if found,
     *   otherwise null.
     */
    async getProductById(id) {
        const product = await Product.getById(id);
        return product;
    },

    /**
     * @function createProduct
     * @description Creates a new product after performing business validation.
     * @param {object} productData - An object containing `name`, `description`, and `price`.
     * @returns {Promise<object>} A promise that resolves to the newly created product object.
     * @throws {Error} If validation fails or there's an issue with creation.
     */
    async createProduct({ name, description, price }) {
        // Business rule: Product name cannot be empty and price must be a positive number.
        if (!name || name.trim() === '') {
            throw new Error('Product name cannot be empty.');
        }
        // Ensure price is a number and non-negative
        const parsedPrice = parseFloat(price);
        if (isNaN(parsedPrice) || parsedPrice < 0) {
            throw new Error('Price must be a non-negative number.');
        }

        const newProduct = new Product(null, name.trim(), description, parsedPrice);
        await newProduct.save(); // Save the new product via the model
        return newProduct;
    },

    /**
     * @function updateProduct
     * @description Updates an existing product with new data after validation.
     * @param {string} id - The unique identifier of the product to update.
     * @param {object} updateData - An object containing fields to update (e.g., `name`, `description`, `price`).
     * @returns {Promise<object|null>} A promise that resolves to the updated product object if found,
     *   otherwise null.
     * @throws {Error} If validation fails or the product is not found.
     */
    async updateProduct(id, { name, description, price }) {
        const existingProduct = await Product.getById(id);
        if (!existingProduct) {
            return null; // Product not found
        }

        // Apply updates and validation
        if (name !== undefined) {
            if (name.trim() === '') {
                throw new Error('Product name cannot be empty.');
            }
            existingProduct.name = name.trim();
        }
        if (description !== undefined) {
            existingProduct.description = description;
        }
        if (price !== undefined) {
            const parsedPrice = parseFloat(price);
            if (isNaN(parsedPrice) || parsedPrice < 0) {
                throw new Error('Price must be a non-negative number.');
            }
            existingProduct.price = parsedPrice;
        }

        await existingProduct.save(); // Save changes via the model
        return existingProduct;
    },

    /**
     * @function deleteProduct
     * @description Deletes a product by its ID.
     * @param {string} id - The unique identifier of the product to delete.
     * @returns {Promise<boolean>} A promise that resolves to true if the product was
     *   successfully deleted, otherwise false.
     */
    async deleteProduct(id) {
        // You might add checks here, e.g., if a product is part of an active order, prevent deletion.
        const isDeleted = await Product.deleteById(id);
        return isDeleted;
    }
};

module.exports = productService;
