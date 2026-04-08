/**
 * @fileoverview Defines the API routes for product management.
 * This module sets up Express router to map specific URL paths
 * to corresponding controller functions for handling HTTP requests.
 */

// Import the Express router to create modular, mountable route handlers.
const express = require('express');
// Import the product controller which contains the logic for handling product-related requests.
const productController = require('../controllers/productController');

// Create a new router object.
const router = express.Router();

/**
 * Route: GET /products/create
 * Description: Renders the form for creating a new product.
 * Controller Function: productController.getCreateProductForm
 */
router.get('/create', productController.getCreateProductForm);

/**
 * Route: POST /products/create
 * Description: Handles the submission of the new product form.
 * Creates a product in the database based on the request body.
 * Controller Function: productController.createProduct
 */
router.post('/create', productController.createProduct);

/**
 * Route: GET /products/
 * Description: Renders a list of all existing products.
 * This will also serve as the default route for '/products'.
 * Controller Function: productController.listProducts
 */
router.get('/', productController.listProducts);

// Export the router to be used by the main application file (app.js).
module.exports = router;
