/**
 * @module routes/productRoutes
 * @description Defines all routes related to product management,
 * mapping HTTP requests to product controller functions.
 */

const express = require('express');
const router = express.Router(); // Create a new Express router instance

// Import product controller functions to handle the business logic
const productController = require('../controllers/productController');

/**
 * Route to display the form for creating a new product.
 * @name GET /products/new
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
router.get('/new', productController.getNewProductForm);

/**
 * Route to handle the submission of a new product form.
 * Creates a new product in the database.
 * @name POST /products
 * @function
 * @param {Object} req - Express request object with new product data in body.
 * @param {Object} res - Express response object.
 */
router.post('/', productController.createProduct);

/**
 * Route to display a list of all products.
 * @name GET /products
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
router.get('/', productController.getAllProducts);

/**
 * Route to display details of a specific product by its ID.
 * @name GET /products/:id
 * @function
 * @param {Object} req - Express request object with product ID in params.
 * @param {Object} res - Express response object.
 */
router.get('/:id', productController.getProductById);

/**
 * Route to display the form for editing an existing product.
 * @name GET /products/:id/edit
 * @function
 * @param {Object} req - Express request object with product ID in params.
 * @param {Object} res - Express response object.
 */
router.get('/:id/edit', productController.getEditProductForm);

/**
 * Route to handle the submission of an updated product form.
 * Updates an existing product in the database.
 * Uses `method-override` to treat this POST request as a PUT.
 * @name PUT /products/:id
 * @function
 * @param {Object} req - Express request object with updated product data in body and ID in params.
 * @param {Object} res - Express response object.
 */
router.put('/:id', productController.updateProduct);

/**
 * Route to delete a specific product by its ID.
 * Uses `method-override` to treat this POST request as a DELETE.
 * @name DELETE /products/:id
 * @function
 * @param {Object} req - Express request object with product ID in params.
 * @param {Object} res - Express response object.
 */
router.delete('/:id', productController.deleteProduct);

module.exports = router; // Export the router to be used in app.js
