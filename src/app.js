/**
 * @file Main application entry point.
 * @description Configures and starts the Express.js server for the PetClinic application.
 * It sets up middleware, views, internationalization, and defines routes.
 * @author Google Senior Engineer
 */

const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const i18n = require('i18n');
const appConfig = require('./config');
const webConfiguration = require('./middleware/webConfiguration');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes'); // Import all routes

// Create an Express application instance
const app = express();

// Configure internationalization (i18n)
i18n.configure({
  locales: appConfig.i18n.locales, // Supported locales from config
  directory: path.join(__dirname, appConfig.i18n.directory), // Path to translation files
  defaultLocale: appConfig.i18n.defaultLocale, // Default locale
  queryParameter: appConfig.i18n.queryParameter, // URL query parameter for language selection (e.g., ?lang=de)
  syncFiles: true, // Create new locale files if missing
  register: global // Make i18n functions available globally (e.g., __(), __n())
});

// Configure view engine (EJS)
app.set('views', path.join(__dirname, 'views')); // Set the directory for view templates
app.set('view engine', 'ejs'); // Use EJS as the templating engine

// Middleware for static files
app.use('/resources', express.static(path.join(__dirname, 'public/resources'))); // Serve static assets from 'public/resources' under '/resources' URL path
app.use('/webjars', express.static(path.join(__dirname, 'node_modules/webjars-bootstrap/dist'))); // Serve Bootstrap from node_modules
app.use('/webjars/font-awesome', express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free'))); // Serve Font Awesome from node_modules

// Middleware for parsing request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies (for form submissions)
app.use(express.json()); // Parse JSON bodies

// Session configuration
app.use(session({
  secret: appConfig.session.secret, // Secret key for signing the session ID cookie
  resave: false, // Don't save session if unmodified
  saveUninitialized: true, // Save new sessions
  cookie: { maxAge: appConfig.session.cookieMaxAge } // Session cookie expiry time
}));

// Flash messages middleware
app.use(flash()); // Enable flash messages for redirects

// Custom middleware to make flash messages available in views
app.use((req, res, next) => {
  res.locals.messages = {
    success: req.flash('message'),
    error: req.flash('error')
  };
  next();
});

// Internationalization middleware
app.use(i18n.init); // Initialize i18n for each request

// Web configuration middleware (for locale resolution)
app.use(webConfiguration.localeResolver()); // Custom locale resolution based on session/query params
app.use(webConfiguration.localeChangeInterceptor()); // Intercepts language changes

// Pass moment.js to views for date formatting
app.locals.moment = require('moment');

// Mount all application routes
app.use('/', routes);

// Global error handler middleware
app.use(errorHandler.handleErrors);

// Start the server
const PORT = appConfig.port;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access the application at http://localhost:${PORT}`);
});

/**
 * PetClinic Node.js Application.
 *
 * @author Google Senior Engineer
 */
