/**
 * @file app.js
 * @description Main entry point for the Node.js PetClinic application.
 * This file initializes the Express application, configures middleware,
 * sets up routes, and starts the server.
 */

// Load environment variables from .env file (if present)
require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const i18n = require('i18n'); // Internationalization library

// Initialize database and models
const sequelize = require('./config/database');
const { models } = require('./config/database'); // Import models for testing purposes

// Import route modules
const systemRoutes = require('./routes/systemRoutes');
const ownerRoutes = require('./routes/ownerRoutes');
const petRoutes = require('./routes/petRoutes');
const visitRoutes = require('./routes/visitRoutes');
const vetRoutes = require('./routes/vetRoutes');

// Create the Express application instance
const app = express();
const PORT = process.env.PORT || 8080;

/**
 * @function configureI18n
 * @description Configures the i18n middleware for internationalization.
 * Messages are loaded from JSON files in the 'locales' directory.
 */
i18n.configure({
  locales: ['en', 'de', 'es', 'fa', 'ko', 'pt', 'ru', 'tr'], // Supported locales
  defaultLocale: 'en', // Default locale if not specified
  directory: path.join(__dirname, 'locales'), // Directory where locale files are stored
  queryParameter: 'lang', // URL query parameter to change locale (e.g., ?lang=de)
  cookie: 'petclinic_locale', // Cookie name to store user's selected locale
  syncFiles: true, // Sync locale files to prevent missing keys on startup
  objectNotation: true, // Enable object notation in locale files
});

// Middleware configuration

// Serve static files from the 'public' directory (CSS, images, fonts, webjars)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/webjars', express.static(path.join(__dirname, '../node_modules/bootstrap/dist')));
app.use('/webjars/font-awesome', express.static(path.join(__dirname, '../node_modules/@fortawesome/fontawesome-free')));


// Parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true }));

// Setup session middleware for flash messages and locale storage
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecretkey', // Use a strong secret from environment variables
  resave: false, // Don't save session if unmodified
  saveUninitialized: true, // Save new sessions
  cookie: { maxAge: 60 * 60 * 1000 } // 1 hour
}));

// Initialize connect-flash for flash messages
app.use(flash());

// Make flash messages and i18n functions available to all templates
app.use((req, res, next) => {
  res.locals.messages = require('express-messages')(req, res); // Flash messages
  res.locals.i18n = i18n; // i18n instance
  res.locals.currentLocale = req.getLocale(); // Current locale

  // Expose current URL path for active menu item logic
  res.locals.path = req.path;
  next();
});

// Internationalization middleware
app.use(i18n.init);

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Specify views directory

// Middleware to allow POST, PUT, DELETE operations via a hidden input field
app.use(methodOverride('_method'));

// Health check endpoint (can be added outside the sync block)
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Database synchronization and server start
// In test environment, skip auto-sync as migrations are handled by sequelize-cli in test/setup.js
if (process.env.NODE_ENV !== 'test') {
  sequelize.sync({ alter: true }) // 'alter: true' updates the schema to match models
    .then(() => {
      console.log('Database synced successfully. Starting server...');

      // Register routes
      app.use('/', systemRoutes);
      app.use('/owners', ownerRoutes);
      app.use('/owners/:ownerId/pets', petRoutes); // Nested route
      app.use('/owners/:ownerId/pets/:petId/visits', visitRoutes); // Nested route
      app.use('/vets', vetRoutes);

      // Global error handler middleware
      app.use((err, req, res, next) => {
        console.error(err.stack); // Log the error stack for debugging
        const status = err.status || 500;
        const message = err.message || req.__('error.general'); // Default general error message

        // Pass error details to the error view
        res.status(status).render('error', {
          status,
          message,
          path: req.originalUrl,
          stack: process.env.NODE_ENV === 'development' ? err.stack : undefined // Show stack only in dev
        });
      });

      // Start the server
      app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
      });
    })
    .catch(err => {
      console.error('Failed to sync database:', err);
      process.exit(1); // Exit process if database connection fails
    });
} else {
  // In test environment, assume database is already migrated/seeded by test setup.
  // Proceed directly to route registration and error handler setup.
  console.log('Skipping database sync in test environment.');
  // Register routes
  app.use('/', systemRoutes);
  app.use('/owners', ownerRoutes);
  app.use('/owners/:ownerId/pets', petRoutes); // Nested route
  app.use('/owners/:ownerId/pets/:petId/visits', visitRoutes); // Nested route
  app.use('/vets', vetRoutes);

  // Global error handler middleware
  app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack for debugging
    const status = err.status || 500;
    const message = err.message || req.__('error.general'); // Default general error message

    // Pass error details to the error view
    res.status(status).render('error', {
      status,
      message,
      path: req.originalUrl,
      stack: process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' ? err.stack : undefined // Show stack in dev and test
    });
  });
}

module.exports = app; // Export app for testing
module.exports.sequelize = sequelize; // Export sequelize instance for testing
module.exports.models = models; // Export models for testing
