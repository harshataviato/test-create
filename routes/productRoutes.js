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

// --- Product Update Routes (Example - not fully implemented in views for simplicity) ---

// In a full application, you'd typically have:
// router.get('/:id/edit', productController.showEditForm); // Displays edit form
// router.post('/:id/update', productController.updateProduct); // Handles edit form submission

// For this example, we'll only provide the POST update route for API like interaction if needed
// Or assume a POST to /products/:id could handle updates directly (though less RESTful for forms)
// For simplicity in this example, direct update from a form is not explicitly linked,
// but the controller method `updateProduct` is available if linked from a view.

// --- Product Deletion Route (Example - not fully implemented in views for simplicity) ---

// In a full application, you'd typically have a POST or DELETE method for deletion
// For this example, we'll provide a POST route for deletion.
// A more robust UI would confirm deletion and might use a dedicated DELETE HTTP verb.
// router.post('/:id/delete', productController.deleteProduct);

module.exports = router;
