// Import the Sequelize instance and DataTypes to define the Product model
const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');
const Product = require('../models/product')(sequelize, DataTypes); // Load the Product model

/**
 * Renders the list of all products.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
exports.getAllProducts = async (req, res) => {
  try {
    // Fetch all products from the database, ordered by creation date (newest first)
    const products = await Product.findAll({ order: [['createdAt', 'DESC']] });
    // Render the 'products/index.ejs' view, passing the fetched products
    res.render('products/index', { products, title: 'All Products' });
  } catch (error) {
    console.error('Error fetching products:', error);
    // Render an error page in case of a server error
    res.status(500).render('error', { title: 'Server Error', message: 'Failed to retrieve products.' });
  }
};

/**
 * Renders the form to create a new product.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
exports.getNewProductForm = (req, res) => {
  // Render the 'products/new.ejs' view. No data needed initially.
  res.render('products/new', { title: 'Add New Product', product: {} }); // Pass an empty product for template consistency
};

/**
 * Handles the creation of a new product from form submission.
 * @param {object} req - The Express request object, containing form data in req.body.
 * @param {object} res - The Express response object.
 */
exports.createProduct = async (req, res) => {
  try {
    // Extract product data from the request body
    const { name, description, price, stock, isActive } = req.body;

    // Create a new product record in the database
    await Product.create({
      name,
      description: description || null, // Allow description to be null if empty string is submitted
      price: parseFloat(price),        // Convert price to a float
      stock: parseInt(stock, 10) || 0, // Convert stock to an integer, default to 0
      isActive: isActive === 'on' ? true : false, // Check if checkbox is 'on'
    });
    // Redirect to the products list page after successful creation
    res.redirect('/products');
  } catch (error) {
    console.error('Error creating product:', error);
    // If it's a validation error (e.g., unique name constraint), render form again with error
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).render('products/new', {
        title: 'Add New Product',
        product: req.body, // Pass submitted data back to pre-fill form
        error: 'Product with this name already exists.'
      });
    }
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => e.message);
      return res.status(400).render('products/new', {
        title: 'Add New Product',
        product: req.body,
        error: messages.join(', ')
      });
    }
    // For other server errors, render a generic error page
    res.status(500).render('error', { title: 'Server Error', message: 'Failed to create product.' });
  }
};

/**
 * Renders the details of a single product.
 * @param {object} req - The Express request object, containing product ID in req.params.
 * @param {object} res - The Express response object.
 */
exports.getProductById = async (req, res) => {
  try {
    // Find a product by its primary key (ID)
    const product = await Product.findByPk(req.params.id);

    // If product not found, render a 404 page
    if (!product) {
      return res.status(404).render('404', { title: 'Product Not Found' });
    }
    // Render the 'products/show.ejs' view, passing the found product
    res.render('products/show', { product, title: product.name });
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    // Render an error page for server errors
    res.status(500).render('error', { title: 'Server Error', message: 'Failed to retrieve product details.' });
  }
};

/**
 * Renders the form to edit an existing product.
 * @param {object} req - The Express request object, containing product ID in req.params.
 * @param {object} res - The Express response object.
 */
exports.getEditProductForm = async (req, res) => {
  try {
    // Find the product to be edited by its ID
    const product = await Product.findByPk(req.params.id);

    // If product not found, render a 404 page
    if (!product) {
      return res.status(404).render('404', { title: 'Product Not Found' });
    }
    // Render the 'products/edit.ejs' view, passing the product data to pre-fill the form
    res.render('products/edit', { product, title: `Edit ${product.name}` });
  } catch (error) {
    console.error('Error fetching product for edit:', error);
    // Render an error page for server errors
    res.status(500).render('error', { title: 'Server Error', message: 'Failed to load product for editing.' });
  }
};

/**
 * Handles the update of an existing product from form submission.
 * @param {object} req - The Express request object, containing product ID in req.params and form data in req.body.
 * @param {object} res - The Express response object.
 */
exports.updateProduct = async (req, res) => {
  try {
    // Find the product to be updated
    const product = await Product.findByPk(req.params.id);

    // If product not found, render a 404 page
    if (!product) {
      return res.status(404).render('404', { title: 'Product Not Found' });
    }

    // Extract updated data from the request body
    const { name, description, price, stock, isActive } = req.body;

    // Update the product record in the database
    await product.update({
      name,
      description: description || null,
      price: parseFloat(price),
      stock: parseInt(stock, 10) || 0,
      isActive: isActive === 'on' ? true : false,
    });
    // Redirect to the updated product's detail page
    res.redirect(`/products/${product.id}`);
  } catch (error) {
    console.error('Error updating product:', error);
    // If it's a validation error, render form again with error
    if (error.name === 'SequelizeUniqueConstraintError') {
      const product = await Product.findByPk(req.params.id); // Re-fetch product to display correct ID
      return res.status(400).render('products/edit', {
        title: 'Edit Product',
        product: { ...req.body, id: req.params.id }, // Merge ID back into product object for form pre-fill
        error: 'Product with this name already exists.'
      });
    }
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => e.message);
      const product = await Product.findByPk(req.params.id);
      return res.status(400).render('products/edit', {
        title: 'Edit Product',
        product: { ...req.body, id: req.params.id },
        error: messages.join(', ')
      });
    }
    // For other server errors, render a generic error page
    res.status(500).render('error', { title: 'Server Error', message: 'Failed to update product.' });
  }
};

/**
 * Handles the deletion of a product.
 * @param {object} req - The Express request object, containing product ID in req.params.
 * @param {object} res - The Express response object.
 */
exports.deleteProduct = async (req, res) => {
  try {
    // Find the product to be deleted
    const product = await Product.findByPk(req.params.id);

    // If product not found, render a 404 page (or simply redirect, depending on UX)
    if (!product) {
      console.warn(`Attempted to delete non-existent product with ID: ${req.params.id}`);
      return res.status(404).render('404', { title: 'Product Not Found' });
    }

    // Delete the product record from the database
    await product.destroy();
    // Redirect to the products list page after successful deletion
    res.redirect('/products');
  } catch (error) {
    console.error('Error deleting product:', error);
    // Render an error page for server errors
    res.status(500).render('error', { title: 'Server Error', message: 'Failed to delete product.' });
  }
};
