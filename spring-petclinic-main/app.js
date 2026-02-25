/**
 * @file app.js
 * @description Main entry point for the Node.js PetClinic application.
 * This file sets up the Express server, database connection, middleware,
 * routes, and view engine. It replaces the functionality of PetClinicApplication.java.
 * @author Google Senior Engineer
 */

require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const path = require('path');
const moment = require('moment'); // For date formatting in views
const { sequelize } = require('./models'); // Sequelize instance and models
const i18n = require('./utils/i18n'); // Custom i18n configuration
const i18nMiddleware = require('./middleware/i18nMiddleware'); // i18n Express middleware
const errorHandler = require('./middleware/errorHandler'); // Custom error handling middleware
const ownerRoutes = require('./routes/ownerRoutes'); // Owner-related routes
const vetRoutes = require('./routes/vetRoutes'); // Vet-related routes
const systemRoutes = require('./routes/systemRoutes'); // System-related routes (welcome, crash)

const app = express();
const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV || 'development';
const STATIC_CACHE_MAX_AGE = parseInt(process.env.STATIC_CACHE_MAX_AGE || '43200', 10); // 12 hours in seconds

// --- View Engine Setup ---
app.set('views', path.join(__dirname, 'views')); // Specify the directory for view templates
app.set('view engine', 'ejs'); // Use EJS as the templating engine

// Make moment.js available to all EJS templates for date formatting
app.locals.moment = moment;

// --- Static Files Middleware ---
// Serves static files (CSS, images, fonts) from the 'public' directory.
// Caching is configured using maxAge from environment variables.
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: STATIC_CACHE_MAX_AGE * 1000 // Convert seconds to milliseconds
}));

// --- Request Body Parsing Middleware ---
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies (for form submissions)
app.use(express.json()); // Parse JSON bodies

// --- Internationalization Middleware ---
// Initializes i18n and sets up response helpers for translation.
app.use(i18nMiddleware(i18n));

// --- Global Data for Layout (simulates Spring's ModelAttributes or shared context) ---
// This middleware runs for all requests and injects common data into the response locals,
// making it available to all views.
app.use((req, res, next) => {
  res.locals.menu = req.path.split('/')[1] || 'home'; // Determine active menu item based on path
  // Add other global data as needed, e.g., application title, user info, etc.
  next();
});

// --- Routes ---
// Mount application routes. Order matters for specific routes vs. general ones.
app.use('/', systemRoutes); // Welcome and system-related routes
app.use('/owners', ownerRoutes); // Owner-related routes (includes pets and visits)
app.use('/vets', vetRoutes); // Vet-related routes

// --- Error Handling Middleware ---
// This middleware catches any errors thrown by previous middleware or route handlers.
// It should be defined last, after all other `app.use()` and `app.get()/post()` calls.
app.use(errorHandler);

/**
 * @function startServer
 * @description Initializes the database connection and starts the Express server.
 * If the database connection fails, the application will not start.
 */
async function startServer() {
  try {
    // Authenticate with the database. This checks if the connection can be established.
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync models with the database (create tables if they don't exist).
    // In a production environment, you would typically use `sequelize db:migrate` CLI command
    // for migrations rather than `sync({ force: true })` or `sync({ alter: true })`.
    // For this example, we assume migrations are run separately.
    // await sequelize.sync({ alter: true }); // Use `alter: true` for safe schema updates during development

    app.listen(PORT, () => {
      console.log(`Server is running in ${NODE_ENV} mode on port ${PORT}`);
      console.log(`Access PetClinic at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database or start server:', error);
    process.exit(1); // Exit with failure code
  }
}

// Start the server
startServer();

module.exports = app; // Export app for testing purposes
