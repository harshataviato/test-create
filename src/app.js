/**
 * @file app.js
 * @description Main entry point for the PetClinic Node.js application.
 * Initializes the Express app, connects to the database, configures middleware,
 * and sets up routes for different parts of the application.
 *
 * This file replaces `PetClinicApplication.java` and handles the overall application
 * lifecycle and setup.
 */

require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const methodOverride = require('method-override');
const i18n = require('./config/i18n'); // Internationalization configuration
const db = require('./config/database'); // Database configuration and connection
const indexRouter = require('./routes/index'); // Main router
const cache = require('./config/cache'); // Caching configuration

const app = express();
const PORT = process.env.PORT || 8080;

/**
 * @function setupMiddleware
 * @description Configures essential middleware for the Express application.
 */
function setupMiddleware() {
  // Serve static files from the 'public' directory
  app.use(express.static(path.join(__dirname, 'public')));
  app.use('/webjars', express.static(path.join(__dirname, '../node_modules/'))); // Serve webjars-like resources

  // Body parser middleware to handle different request body types
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // Method override for POST requests to simulate PUT/DELETE
  app.use(methodOverride('_method'));

  // Cookie parser middleware
  app.use(cookieParser());

  // Session middleware
  app.use(session({
    secret: 'petclinic-secret', // Replace with a strong secret in production
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
  }));

  // Internationalization middleware
  app.use(i18n.init);

  // Set local variables for templates (e.g., current locale)
  app.use((req, res, next) => {
    res.locals.lang = req.locale;
    next();
  });

  // Health check endpoints
  app.get('/healthz/live', (req, res) => res.status(200).send('Live'));
  app.get('/healthz/ready', (req, res) => res.status(200).send('Ready'));
}

/**
 * @function setupViewEngine
 * @description Configures EJS as the templating engine.
 */
function setupViewEngine() {
  app.set('views', path.join(__dirname, 'views')); // Set the views directory
  app.set('view engine', 'ejs'); // Set EJS as the view engine
}

/**
 * @function setupRoutes
 * @description Registers all application routes.
 */
function setupRoutes() {
  app.use('/', indexRouter); // Use the main router for all routes
}

/**
 * @function setupErrorHandling
 * @description Configures error handling middleware.
 * This catches errors and renders a custom error page.
 */
function setupErrorHandling() {
  // Catch 404 and forward to error handler
  app.use((req, res, next) => {
    res.status(404).render('error', {
      message: res.__('error.404'),
      status: 404,
      stack: process.env.NODE_ENV === 'development' ? new Error().stack : undefined
    });
  });

  // General error handler
  app.use((err, req, res, next) => {
    // Log the error in development mode
    if (process.env.NODE_ENV === 'development') {
      console.error(err.stack);
    }

    res.status(err.status || 500);
    res.render('error', {
      message: err.message || res.__('error.general'),
      status: err.status || 500,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  });
}

/**
 * @function startServer
 * @description Connects to the database and starts the Express server.
 */
async function startServer() {
  try {
    await db.authenticate(); // Test database connection
    console.log('Database connection has been established successfully.');
    // Synchronize models (creates tables if they don't exist)
    // For production, consider using migrations instead of `sync({ alter: true })`
    await db.sync({ alter: true });
    console.log('Database models synchronized.');
    await db.seedData(); // Seed initial data

    setupMiddleware();
    setupViewEngine();
    setupRoutes();
    setupErrorHandling();

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`Application started in ${process.env.NODE_ENV || 'development'} mode.`);
    });
  } catch (error) {
    console.error('Unable to connect to the database or start server:', error);
    process.exit(1); // Exit if database connection fails
  }
}

// Start the application
startServer();

module.exports = app; // Export app for testing purposes
