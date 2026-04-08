/**
 * @fileoverview Main entry point for the Product Management Node.js application.
 * Sets up the Express server, configures middleware, defines view engine,
 * and mounts application routes.
 */

// Import the Express.js framework
const express = require('express');
// Import the product routes
const productRoutes = require('./routes/productRoutes');
// Import Node.js 'path' module for handling and transforming file paths
const path = require('path');

// Create an Express application instance
const app = express();
// Define the port on which the server will listen
const PORT = process.env.PORT || 3000;

/**
 * Middleware Setup
 */

// Serve static files from the 'public' directory.
// This allows browsers to access CSS, JavaScript, images, etc.
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse incoming request bodies with URL-encoded payloads.
// This is necessary to handle form submissions (e.g., from product-create.ejs).
// `extended: true` allows for rich objects and arrays to be encoded into the URL-encoded format.
app.use(express.urlencoded({ extended: true }));

// Middleware to parse incoming request bodies with JSON payloads.
// Useful for API endpoints that receive JSON data, though not strictly required for this simple form-based app.
app.use(express.json());

/**
 * View Engine Setup
 * Configures EJS (Embedded JavaScript) as the template engine for rendering views.
 */

// Set the view engine to EJS
app.set('view engine', 'ejs');
// Specify the directory where EJS template files are located
app.set('views', path.join(__dirname, 'views'));

/**
 * Route Handlers
 * Define the routes for the application.
 */

// Mount product routes under the '/products' path.
// All routes defined in productRoutes.js (e.g., '/', '/create') will be prefixed with '/products'.
app.use('/products', productRoutes);

// Define a root route that redirects to the product list page.
// This makes http://localhost:3000/ friendly by sending users directly to /products.
app.get('/', (req, res) => {
  // Redirect to the product list page
  res.redirect('/products');
});

/**
 * Error Handling (Optional but good practice)
 * Catches 404 errors (resource not found) and forwards them to an error handler.
 */
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error); // Pass the error to the next middleware
});

/**
 * Global Error Handler
 * Handles any errors that occur during request processing.
 * Renders a generic error page.
 * @param {Error} err - The error object.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function (not used here but required by Express signature).
 */
app.use((err, req, res, next) => {
  // Set the HTTP status code for the response. Default to 500 (Internal Server Error).
  res.status(err.status || 500);
  // Render an error view. In a real app, you might have an 'error.ejs' template.
  res.render('error', {
    pageTitle: 'Error',
    message: err.message,
    // Only send stack trace in development mode for security reasons
    error: app.get('env') === 'development' ? err : {}
  });
});


/**
 * Server Start
 * Starts the Express server and listens for incoming requests on the specified port.
 */
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Access product list at: http://localhost:${PORT}/products`);
  console.log(`Access product creation at: http://localhost:${PORT}/products/create`);
});
