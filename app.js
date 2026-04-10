/**
 * @fileoverview Main entry point for the Harsha Taviato Test application.
 * This file sets up the Express server, configures middleware, initializes the database,
 * and registers all application routes.
 */

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const { engine } = require('express-handlebars');
const methodOverride = require('method-override');
const path = require('path');
const db = require('./models'); // Database connection and models
const itemRoutes = require('./routes/itemRoutes'); // Item-specific routes

const app = express();
const PORT = process.env.PORT || 3000;

// --- Express Middleware Configuration ---

/**
 * Configure Handlebars as the template engine.
 * @param {object} engine - The Handlebars engine function.
 * @param {object} options - Configuration options for Handlebars.
 * @param {string} options.defaultLayout - The default layout file to use for all views.
 * @param {string} options.layoutsDir - The directory where layout templates are located.
 * @param {string} options.partialsDir - The directory where partial templates are located.
 * @returns {void}
 */
app.engine('hbs', engine({
    defaultLayout: 'main', // Specifies the default layout template (e.g., layouts/main.hbs)
    layoutsDir: path.join(__dirname, 'views/layouts'), // Directory for layout templates
    partialsDir: path.join(__dirname, 'views/partials'), // Directory for partial templates
    extname: '.hbs' // File extension for Handlebars templates
}));
app.set('view engine', 'hbs'); // Set Handlebars as the view engine
app.set('views', path.join(__dirname, 'views')); // Set the directory where view templates are located

/**
 * Middleware to parse URL-encoded bodies (form data).
 * @param {object} options - Configuration options for urlencoded.
 * @param {boolean} options.extended - Allows for rich objects and arrays to be encoded into the URL-encoded format.
 * @returns {void}
 */
app.use(express.urlencoded({ extended: true }));

/**
 * Middleware to parse JSON bodies.
 * @returns {void}
 */
app.use(express.json());

/**
 * Middleware to enable HTTP method override.
 * This allows forms to use POST requests to simulate PUT or DELETE requests,
 * which is useful for browser-based applications that don't natively support PUT/DELETE forms.
 * It looks for a `_method` query parameter or form field (e.g., `<input type="hidden" name="_method" value="DELETE">`).
 * @param {string} method - The method to look for in the request (e.g., '_method').
 * @returns {void}
 */
app.use(methodOverride('_method'));

/**
 * Serve static files from the 'public' directory.
 * E.g., CSS, JavaScript, images.
 * @param {string} root - The root directory from which to serve static assets.
 * @returns {void}
 */
app.use(express.static(path.join(__dirname, 'public')));

// --- Routes ---

/**
 * Mount the item-specific routes.
 * All routes defined in `itemRoutes.js` will be prefixed with `/items`.
 * @param {string} path - The base path for these routes.
 * @param {object} router - The Express router instance for item routes.
 * @returns {void}
 */
app.use('/items', itemRoutes);

/**
 * Root route - Redirects to the items listing page.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @returns {void}
 */
app.get('/', (req, res) => {
    res.redirect('/items');
});

/**
 * Test route to explicitly trigger the global error handler for testing purposes.
 * This route should typically not be present in a production application.
 */
app.get('/test-error', (req, res, next) => {
    next(new Error('This is a test error for the global handler.'));
});

// --- Database Synchronization and Server Start ---

/**
 * Global error handling middleware.
 * This catches any errors that occur during request processing.
 * @param {Error} err - The error object.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function.
 * @returns {void}
 */
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack for debugging
    // Render the 'error' view for 500 errors
    res.status(500).render('error', {
        message: 'Something broke!',
        // Provide error details only in development environment
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Export app and db for testing purposes.
// The actual server start will be handled conditionally or by test runners.
module.exports = app;
module.exports.db = db;

/**
 * Synchronizes all defined Sequelize models with the database and starts the server.
 * This block is executed only if the environment is NOT 'test', allowing test runners
 * to control the server lifecycle.
 * @returns {Promise<void>}
 */
if (process.env.NODE_ENV !== 'test') {
    db.sequelize.sync()
        .then(() => {
            // Start the server only after the database connection and models are synced
            app.listen(PORT, () => {
                console.log(`Server is running on http://localhost:${PORT}`);
            });
        })
        .catch(err => {
            console.error('Unable to connect to the database:', err);
            // Exit the process if database connection fails
            process.exit(1);
        });
}
