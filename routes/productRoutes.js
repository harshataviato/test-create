// Import the Express router to define routes
const express = require('express');
const router = express.Router();

// Import the product controller which contains the business logic for each route
const productController = require('../controllers/productController');

/**
 * @route GET /products
 * @description Renders a list of all products.
 * @access Public
 */
router.get('/', productController.getAllProducts);

/**
 * @route GET /products/new
 * @description Renders the form to add a new product.
 * @access Public
 */
router.get('/new', productController.getNewProductForm);

/**
 * @route POST /products
 * @description Handles the submission of the new product form to create a product.
 * @access Public
 */
router.post('/', productController.createProduct);

/**
 * @route GET /products/:id
 * @description Renders the details page for a single product by ID.
 * @param {string} id - The unique identifier of the product.
 * @access Public
 */
router.get('/:id', productController.getProductById);

/**
 * @route GET /products/:id/edit
 * @description Renders the form to edit an existing product by ID.
 * @param {string} id - The unique identifier of the product to edit.
 * @access Public
 */
router.get('/:id/edit', productController.getEditProductForm);

/**
 * @route POST /products/:id
 * @description Handles the submission of the edit product form to update a product by ID.
 *              Note: HTML forms primarily support GET and POST. For PUT/PATCH/DELETE,
 *              a common pattern in web apps is to use POST with a hidden input
 *              `_method` or route via POST and handle the update logic.
 *              Here, we use POST directly for simplicity.
 * @param {string} id - The unique identifier of the product to update.
 * @access Public
 */
router.post('/:id', productController.updateProduct);

/**
 * @route POST /products/:id/delete
 * @description Handles the deletion of a product by ID.
 *              Similar to update, HTML forms use POST for delete actions.
 * @param {string} id - The unique identifier of the product to delete.
 * @access Public
 */
router.post('/:id/delete', productController.deleteProduct);

// Export the router to be used in the main application file (app.js)
module.exports = router;
