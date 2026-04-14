/**
 * @file productRoutes.js
 * @description This file defines the API endpoints (routes) for product-related operations.
 * It uses Express Router to group routes and maps them to corresponding controller functions.
 */

const express = require('express');
const router = express.Router(); // Create a new Express Router instance
const productController = require('../controllers/productController'); // Import the product controller

// --- Product Listing and Details Routes ---

/**
 * @route GET /products/
 * @description Route to get and display a list of all products.
 * Mapped to the `getAllProducts` function in `productController`.
 */
router.get('/', productController.getAllProducts);

/**
 * @route GET /products/:id
 * @description Route to get and display details of a specific product by its ID.
 * The `:id` is a route parameter that will be available in `req.params.id`.
 * Mapped to the `getProductById` function in `productController`.
 */
router.get('/:id', productController.getProductById);

// --- Product Creation Routes ---

/**
 * @route GET /products/create
 * @description Route to display the form for creating a new product.
 * Mapped to the `showCreateForm` function in `productController`.
 */
router.get('/create', productController.showCreateForm);

/**
 * @route POST /products/
 * @description Route to handle the submission of the new product form.
 * This route creates a new product in the system.
 * Mapped to the `createProduct` function in `productController`.
 */
router.post('/', productController.createProduct);

// --- Product Update Routes ---
/**
 * @route POST /products/:id/update
 * @description Route to handle the submission of an update form for an existing product.
 * Mapped to the `updateProduct` function in `productController`.
 */
router.post('/:id/update', productController.updateProduct);


// --- Product Deletion Route ---
/**
 * @route POST /products/:id/delete
 * @description Route to handle the deletion of a product.
 * Mapped to the `deleteProduct` function in `productController`.
 */
router.post('/:id/delete', productController.deleteProduct);

module.exports = router;
