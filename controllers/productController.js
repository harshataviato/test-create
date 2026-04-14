/**
 * @file productController.js
 * @description This file contains the controller functions for handling product-related
 * HTTP requests. It acts as the bridge between the client (browser) and the service layer.
 * It's responsible for parsing request data, calling the appropriate service methods,
 * and rendering views or sending JSON responses.
 */

const productService = require('../services/productService'); // Import the product service

/**
 * @module productController
 * @description Provides controller functions for managing products.
 */
const productController = {

    /**
     * @function getAllProducts
     * @description Renders a list of all products.
     * @param {object} req - The Express request object.
     * @param {object} res - The Express response object.
     * @returns {Promise<void>} Renders the 'products/list' view with product data.
     */
    async getAllProducts(req, res) {
        try {
            const products = await productService.getAllProducts(); // Get all products from the service
            // Render the 'products/list.ejs' view, passing an object with 'products' data
            res.render('products/list', { products, title: 'Product List' });
        } catch (error) {
            console.error('Error fetching products:', error);
            // Render an error view or send an error message
            res.status(500).render('error', { message: 'Failed to load products.' });
        }
    },

    /**
     * @function getProductById
     * @description Renders the detail view for a specific product.
     * @param {object} req - The Express request object, containing `params.id`.
     * @param {object} res - The Express response object.
     * @returns {Promise<void>} Renders 'products/detail' view or a 404 if not found.
     */
    async getProductById(req, res) {
        try {
            const { id } = req.params; // Extract product ID from URL parameters
            const product = await productService.getProductById(id); // Get product by ID from service

            if (product) {
                // Render the 'products/detail.ejs' view
                res.render('products/detail', { product, title: `Product: ${product.name}` });
            } else {
                // If product not found, send a 404 response
                res.status(404).render('error', { message: 'Product not found.' });
            }
        } catch (error) {
            console.error(`Error fetching product with ID ${req.params.id}:`, error);
            res.status(500).render('error', { message: 'Failed to load product details.' });
        }
    },

    /**
     * @function showCreateForm
     * @description Renders the form to create a new product.
     * @param {object} req - The Express request object.
     * @param {object} res - The Express response object.
     * @returns {void} Renders the 'products/create' view.
     */
    showCreateForm(req, res) {
        // Simply render the form for creating a new product
        res.render('products/create', { title: 'Create New Product', product: {} }); // Pass empty product for template
    },

    /**
     * @function createProduct
     * @description Handles the POST request to create a new product.
     * @param {object} req - The Express request object, containing `body` data.
     * @param {object} res - The Express response object.
     * @returns {Promise<void>} Redirects to the product list or renders the form with errors.
     */
    async createProduct(req, res) {
        try {
            // Extract product data from the request body
            const { name, description, price } = req.body;
            // Call the service to create the product
            await productService.createProduct({ name, description, price });
            // Redirect to the products list page after successful creation
            res.redirect('/products');
        } catch (error) {
            console.error('Error creating product:', error);
            // If validation fails or another error occurs, render the form again with an error message
            res.status(400).render('products/create', {
                title: 'Create New Product',
                product: req.body, // Populate form with previous input
                error: error.message // Pass the error message to the view
            });
        }
    },

    /**
     * @function updateProduct
     * @description Handles the POST request to update an existing product.
     * @param {object} req - The Express request object, containing `params.id` and `body` data.
     * @param {object} res - The Express response object.
     * @returns {Promise<void>} Redirects to the product detail page or renders form with errors.
     */
    async updateProduct(req, res) {
        try {
            const { id } = req.params; // Product ID from URL
            const { name, description, price } = req.body; // Updated data from form
            const updatedProduct = await productService.updateProduct(id, { name, description, price });

            if (updatedProduct) {
                // Redirect to the updated product's detail page
                res.redirect(`/products/${id}`);
            } else {
                res.status(404).render('error', { message: 'Product not found for update.' });
            }
        } catch (error) {
            console.error(`Error updating product with ID ${req.params.id}:`, error);
            // In a real app, you might re-render an edit form with error messages
            res.status(400).render('error', { message: `Failed to update product: ${error.message}` });
        }
    },

    /**
     * @function deleteProduct
     * @description Handles the POST request to delete a product.
     * @param {object} req - The Express request object, containing `params.id`.
     * @param {object} res - The Express response object.
     * @returns {Promise<void>} Redirects to the product list.
     */
    async deleteProduct(req, res) {
        try {
            const { id } = req.params; // Product ID from URL
            const isDeleted = await productService.deleteProduct(id);

            if (isDeleted) {
                // Redirect to the products list page after successful deletion
                res.redirect('/products');
            } else {
                res.status(404).render('error', { message: 'Product not found for deletion.' });
            }
        } catch (error) {
            console.error(`Error deleting product with ID ${req.params.id}:`, error);
            res.status(500).render('error', { message: 'Failed to delete product.' });
        }
    }
};

module.exports = productController;
