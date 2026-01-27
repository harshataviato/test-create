/**
 * @fileoverview Main Express application setup.
 * This file configures the Express app, sets up middleware, i18n, database connection,
 * static file serving, view engine, and registers all application routes.
 */

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const i18n = require('./config/i18n'); // Internationalization configuration
const sequelize = require('./config/database'); // Sequelize database connection
const router = require('./routes'); // Main application router

const app = express();

// --- Middleware Setup ---

// Set up i18n middleware
app.use(i18n.init);

// Session middleware for flash messages and locale storage
app.use(session({
  secret: 'petclinic-secret-key', // Strong secret key for session encryption
  resave: false, // Do not save session if unmodified
  saveUninitialized: false, // Do not create session until something stored
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24-hour cookie life
}));

// Flash messages middleware for one-time messages after redirects
app.use(flash());

// Custom middleware to make flash messages available in views
app.use((req, res, next) => {
  res.locals.messages = req.flash('message');
  res.locals.errors = req.flash('error');
  next();
});

// Body-parser middleware to parse URL-encoded bodies (for form data)
app.use(bodyParser.urlencoded({ extended: true }));
// Body-parser middleware to parse JSON bodies (for API requests)
app.use(bodyParser.json());

// Serve static files from the 'public' directory
// This includes CSS, images, and other client-side assets
app.use('/resources', express.static(path.join(__dirname, 'public/resources')));
app.use('/webjars', express.static(path.join(__dirname, '../node_modules'))); // Serve webjars (bootstrap, font-awesome)

// Set EJS as the view engine
app.set('view engine', 'ejs');
// Specify the directory where view templates are located
app.set('views', path.join(__dirname, 'views'));

// Global template variables
// These variables are available in all EJS templates
app.locals.moment = require('moment'); // For date formatting in views
app.locals.__ = i18n.__; // i18n translation function
app.locals.i18n = i18n; // i18n object itself

// Add `__` and `__n` for easy access in templates.
// `i18n.setLocale(req.session.locale || i18n.getLocale());` will be called in middleware.
app.use((req, res, next) => {
  res.locals.__(i18n.__);
  res.locals.__n(i18n.__n);
  next();
});


// --- Database Synchronization (for development/testing, use migrations in production) ---
// Sync all models with the database. This creates tables if they don't exist.
// In a production environment, use Sequelize migrations (`npx sequelize-cli db:migrate`).
// sequelize.sync({ force: false }) // `force: true` drops tables before recreating
//   .then(() => {
//     console.log('Database & tables created!');
//   })
//   .catch(err => {
//     console.error('Error synchronizing database:', err);
//   });

// --- Routes ---
// Register the main router for the application
app.use('/', router);

// --- Global Error Handling Middleware ---
/**
 * @function globalErrorHandler
 * @description Catches all unhandled errors in the application.
 * Renders a generic error page with relevant information.
 * @param {Error} err - The error object.
 * @param {express.Request} req - The Express request object.
 * @param {express.Response} res - The Express response object.
 * @param {express.NextFunction} next - The Express next middleware function.
 */
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging

  // Determine HTTP status code, default to 500
  const status = err.statusCode || err.status || 500;
  // Determine error message, default to a generic message
  const message = err.message || req.__('error.general'); // Use i18n for generic error

  // Set the response status
  res.status(status);

  // Render the error view
  res.render('error', {
    // Pass relevant error details to the error template
    status: status,
    message: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined // Show stack only in dev
  });
});

module.exports = app;
