/**
 * @module controllers/productController
 * @description Handles all product-related logic for the application,
 * interacting with the Product model and rendering views.
 */

const Product = require('../models/product'); // Import the Product Mongoose model

/**
 * Renders the form to create a new product.
 * @function getNewProductForm
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {void} Renders the 'products/new' EJS template.
 */
exports.getNewProductForm = (req, res) => {
  res.render('products/new', { title: 'Create New Product' });
};

/**
 * Creates a new product based on the request body.
 * Redirects to the product list or re-renders the form with errors.
 * @async
 * @function createProduct
 * @param {Object} req - The Express request object, containing product data in `req.body`.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} Redirects on success, renders form with errors on failure.
 */
exports.createProduct = async (req, res) => {
  try {
    // Create a new product instance using data from the request body
    const product = new Product(req.body);
    // Save the product to the database
    await product.save();
    // Redirect to the products list page after successful creation
    res.redirect('/products');
  } catch (error) {
    // If an error occurs (e.g., validation error), log it and re-render the form
    console.error('Error creating product:', error);
    // Render the new product form again, passing the error message
    // In a real app, you might want to parse validation errors more granularly
    res.render('products/new', { title: 'Create New Product', error: error.message });
  }
};

/**
 * Retrieves and displays a list of all products.
 * @async
 * @function getAllProducts
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} Renders the 'products/index' EJS template with all products.
 */
exports.getAllProducts = async (req, res) => {
  try {
    // Find all products in the database
    const products = await Product.find({});
    // Render the products index page, passing the fetched products
    res.render('products/index', { title: 'All Products', products: products });
  } catch (error) {
    // If an error occurs, log it and render an error page
    console.error('Error fetching products:', error);
    res.status(500).render('error', { title: 'Error', message: 'Failed to retrieve products', error: error });
  }
};

/**
 * Retrieves and displays a single product by its ID.
 * @async
 * @function getProductById
 * @param {Object} req - The Express request object, containing product ID in `req.params.id`.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} Renders the 'products/show' EJS template or a 404 page.
 */
exports.getProductById = async (req, res) => {
  try {
    // Find a product by its ID from the URL parameters
    const product = await Product.findById(req.params.id);
    if (!product) {
      // If no product is found, render a 404 page
      return res.status(404).render('error', { title: 'Product Not Found', message: 'The product you requested does not exist.' });
    }
    // Render the product show page, passing the found product
    res.render('products/show', { title: product.name, product: product });
  } catch (error) {
    // If an error occurs (e.g., invalid ID format), log it and render an error page
    console.error('Error fetching product by ID:', error);
    res.status(500).render('error', { title: 'Error', message: 'Failed to retrieve product', error: error });
  }
};

/**
 * Renders the form to edit an existing product.
 * @async
 * @function getEditProductForm
 * @param {Object} req - The Express request object, containing product ID in `req.params.id`.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} Renders the 'products/edit' EJS template or a 404 page.
 */
exports.getEditProductForm = async (req, res) => {
  try {
    // Find the product to edit by its ID
    const product = await Product.findById(req.params.id);
    if (!product) {
      // If no product is found, render a 404 page
      return res.status(404).render('error', { title: 'Product Not Found', message: 'The product you are trying to edit does not exist.' });
    }
    // Render the edit product form, pre-filling it with the product data
    res.render('products/edit', { title: `Edit ${product.name}`, product: product });
  } catch (error) {
    console.error('Error fetching product for edit:', error);
    res.status(500).render('error', { title: 'Error', message: 'Failed to load edit form', error: error });
  }
};

/**
 * Updates an existing product based on the request body and product ID.
 * @async
 * @function updateProduct
 * @param {Object} req - The Express request object, containing product ID in `req.params.id` and updated data in `req.body`.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} Redirects to the product's show page or re-renders the form with errors.
 */
exports.updateProduct = async (req, res) => {
  try {
    // Find the product by ID and update it with the new data from req.body
    // { new: true } returns the updated document
    // { runValidators: true } ensures schema validators are run on the update operation
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) {
      // If no product is found, render a 404 page
      return res.status(404).render('error', { title: 'Product Not Found', message: 'The product you are trying to update does not exist.' });
    }
    // Redirect to the updated product's detail page
    res.redirect(`/products/${product._id}`);
  } catch (error) {
    console.error('Error updating product:', error);
    // Re-render the edit form with the error message and the current product data
    // (req.body might contain partial valid data, req.params.id is the original product ID)
    const product = await Product.findById(req.params.id); // Re-fetch product to display correct form
    res.render('products/edit', { title: `Edit ${product ? product.name : 'Product'}`, product: product, error: error.message });
  }
};

/**
 * Deletes a product by its ID.
 * @async
 * @function deleteProduct
 * @param {Object} req - The Express request object, containing product ID in `req.params.id`.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} Redirects to the product list page.
 */
exports.deleteProduct = async (req, res) => {
  try {
    // Find the product by ID and delete it
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      // If no product is found, render a 404 page
      return res.status(404).render('error', { title: 'Product Not Found', message: 'The product you are trying to delete does not exist.' });
    }
    // Redirect to the products list page after successful deletion
    res.redirect('/products');
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).render('error', { title: 'Error', message: 'Failed to delete product', error: error });
  }
};
