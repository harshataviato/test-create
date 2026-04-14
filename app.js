/**
 * @file app.js
 * @description This is the main entry point for the Node.js Express application.
 * It sets up the Express server, configures middleware, defines the view engine,
 * and mounts all application routes.
 */

const express = require('express');
const path = require('path');
const productRoutes = require('./routes/productRoutes'); // Import product routes

const app = express();
const port = 3000; // Define the port for the server to listen on

// --- Middleware Configuration ---

/**
 * @function express.urlencoded
 * @description Middleware to parse URL-encoded bodies (form submissions).
 * It makes form data available in `req.body`.
 * `extended: true` allows for rich objects and arrays to be encoded into the URL-encoded format.
 */
app.use(express.urlencoded({ extended: true }));

/**
 * @function express.json
 * @description Middleware to parse JSON bodies.
 * It makes JSON data available in `req.body`.
 * Useful for API endpoints that receive JSON payloads.
 */
app.use(express.json());

// --- View Engine Setup ---

/**
 * @property {string} 'views'
 * @description Sets the directory where the view template files are located.
 * `path.join(__dirname, 'views')` resolves to the absolute path of the 'views' directory.
 */
app.set('views', path.join(__dirname, 'views'));

/**
 * @property {string} 'view engine'
 * @description Sets the template engine to use. Here, EJS (Embedded JavaScript) is chosen.
 * EJS allows embedding plain JavaScript within HTML templates.
 */
app.set('view engine', 'ejs');

// --- Routes Configuration ---

/**
 * @route GET /
 * @description Handles the root URL. Redirects to the products list page.
 */
app.get('/', (req, res) => {
    // Redirect to the /products endpoint
    res.redirect('/products');
});

/**
 * @function app.use
 * @description Mounts the product routes to the `/products` path.
 * All routes defined in `productRoutes` will be prefixed with `/products`.
 * For example, a route defined as `/` in `productRoutes` becomes `/products/`.
 */
app.use('/products', productRoutes);

// --- Error Handling Middleware (Basic) ---

/**
 * @function app.use
 * @description Catches any requests that don't match existing routes (404 Not Found).
 * This middleware should be placed after all other routes.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function in the stack.
 */
app.use((req, res, next) => {
    res.status(404).send("Sorry, that page doesn't exist!");
});

/**
 * @function app.use
 * @description Global error handling middleware.
 * Catches any errors thrown by previous middleware or route handlers.
 * @param {object} err - The error object.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function in the stack.
 */
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack to the console for debugging
    res.status(500).send('Something broke!'); // Send a generic 500 error response
});

// --- Server Start ---

/**
 * @function app.listen
 * @description Starts the Express server and makes it listen for incoming requests
 * on the specified port.
 * @param {number} port - The port number to listen on.
 * @param {function} callback - A callback function executed once the server starts.
 */
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log(`Open http://localhost:${port}/products in your browser.`);
});
