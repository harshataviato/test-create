/**
 * @fileoverview Product controller module responsible for handling
 * product-related requests, processing data, and interacting with the view layer.
 * It acts as an intermediary between routes and the data store (db.js).
 */

// Import the in-memory database functions for product persistence.
const db = require('../config/db');
// Import the Product model to ensure data consistency.
const Product = require('../models/product');

/**
 * Renders the product creation form.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @returns {void} Renders the 'product-create' EJS template.
 */
exports.getCreateProductForm = (req, res) => {
  // Render the EJS template for creating a product.
  // The 'layout' variable is passed to be used by views/layout.ejs to wrap the content.
  res.render('product-create', {
    pageTitle: 'Create New Product', // Title for the HTML page
    path: '/products/create'        // Used for active navigation links (if implemented in layout)
  });
};

/**
 * Handles the submission of the product creation form.
 * Creates a new product, saves it to the database, and redirects to the product list.
 * @param {object} req - The Express request object, containing form data in req.body.
 * @param {object} res - The Express response object.
 * @returns {void} Redirects to '/products' on success, or renders the form with errors on failure.
 */
exports.createProduct = (req, res) => {
  const { name, description, price } = req.body; // Destructure data from the request body

  // Input validation: Basic checks for presence and type.
  // In a real application, more robust validation (e.g., using a library like Joi or Express-validator)
  // would be used, and error messages would be more user-friendly.
  if (!name || !description || !price || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
    // If validation fails, re-render the form with an error message and pre-filled data.
    return res.render('product-create', {
      pageTitle: 'Create New Product',
      path: '/products/create',
      errorMessage: 'Please enter valid product details (name, description, and a non-negative price).',
      // Pass back the entered data to pre-fill the form fields
      oldInput: { name, description, price }
    });
  }

  try {
    // Create a new Product instance using the Product model.
    // This helps in validating the structure and potentially provides methods.
    const newProduct = new Product(name, description, parseFloat(price));

    // Save the product data to our in-memory database.
    // The db.saveProduct function will add an ID and createdAt timestamp.
    db.saveProduct(newProduct.toObject()); // Pass a plain object to the db layer

    // After successful creation, redirect the user to the product list page.
    res.redirect('/products');
  } catch (error) {
    // Catch any errors thrown by the Product constructor (e.g., validation errors)
    console.error('Error creating product:', error.message);
    res.render('product-create', {
      pageTitle: 'Create New Product',
      path: '/products/create',
      errorMessage: error.message || 'An unexpected error occurred while creating the product.',
      oldInput: { name, description, price }
    });
  }
};

/**
 * Renders a list of all products.
 * Retrieves all products from the database and displays them in a view.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @returns {void} Renders the 'product-list' EJS template with product data.
 */
exports.listProducts = (req, res) => {
  // Retrieve all products from the in-memory database.
  const products = db.getProducts();

  // Render the EJS template for displaying the list of products.
  res.render('product-list', {
    pageTitle: 'Product List', // Title for the HTML page
    path: '/products',          // Used for active navigation links
    products: products          // Pass the array of products to the template
  });
};
