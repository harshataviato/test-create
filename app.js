/**
 * @module app
 * @description Main entry point for the PetClinic Node.js application.
 * Configures the Express app, database, internationalization, and registers routes.
 */

require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const i18n = require('./config/i18n'); // Internationalization configuration
const db = require('./config/database'); // Database configuration and models
const cache = require('./utils/cache'); // Caching utility
const localeMiddleware = require('./middleware/localeMiddleware'); // Middleware for locale switching

// Route imports
const homeRoutes = require('./routes/homeRoutes');
const ownerRoutes = require('./routes/ownerRoutes');
const petRoutes = require('./routes/petRoutes');
const visitRoutes = require('./routes/visitRoutes');
const vetRoutes = require('./routes/vetRoutes');
const errorRoutes = require('./routes/errorRoutes');

const app = express();
const PORT = process.env.PORT || 8080;

/**
 * @function setupDatabase
 * @description Initializes the database connection and synchronizes models.
 * @async
 * @returns {Promise<void>} A promise that resolves when the database is connected and synced.
 */
async function setupDatabase() {
  try {
    await db.sequelize.authenticate(); // Test the database connection
    console.log('Database connection has been established successfully.');
    // `alter: true` will update the table schema to match the model if there are changes.
    // In production, consider using migrations for schema changes.
    // In test environment, `force: true` will be used via `test/setup.js` for clean slate.
    // For other environments, `alter: true` or migrations are suitable.
    await db.sequelize.sync({ alter: process.env.NODE_ENV !== 'test' });
    console.log('All models were synchronized successfully.');
    // Seed initial data if in development environment
    if (process.env.NODE_ENV === 'development') {
      await require('./config/seedData').seed();
    }
  } catch (error) {
    console.error('Unable to connect to the database or synchronize models:', error);
    process.exit(1); // Exit if database connection fails
  }
}

// === Application Setup ===

// Set up view engine (EJS)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse URL-encoded bodies (for form data)
app.use(bodyParser.urlencoded({ extended: true }));
// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Initialize i18n middleware
app.use(i18n.init);
// Custom middleware to handle locale changes via query parameter
app.use(localeMiddleware);

// Global view variables (e.g., accessible in all EJS templates)
app.use((req, res, next) => {
  res.locals.moment = require('moment'); // Make moment.js available in templates
  res.locals.__ = res.__; // Make i18n translation function available in templates
  res.locals.currentLocale = i18n.getLocale(req); // Pass current locale to templates
  next();
});

// === Register Routes ===
app.use('/', homeRoutes);
app.use('/owners', ownerRoutes);
app.use('/owners/:ownerId/pets', petRoutes); // Nested pets routes
app.use('/owners/:ownerId/pets/:petId/visits', visitRoutes); // Nested visits routes
app.use('/vets', vetRoutes);
app.use('/oups', errorRoutes); // Error simulation route

// === Error Handling Middleware ===
// Catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Global error handler
app.use((err, req, res, next) => {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.locals.status = err.status || 500;

  // Render the error page
  res.status(err.status || 500);
  res.render('error', { title: `Error ${res.locals.status}` });
});

/**
 * @function startServer
 * @description Starts the Express server after setting up the database.
 */
async function startServer() {
  await setupDatabase(); // Ensure database is ready before starting the server
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Open in browser: http://localhost:${PORT}`);
  });
}

// Only start the server if this file is run directly (not required by another module like test files)
if (require.main === module) {
  startServer();
}

// Clear vet cache on server shutdown (optional, good practice for graceful exits)
process.on('SIGINT', () => {
  console.log('Clearing vet cache and shutting down...');
  cache.clear('vets'); // Clear vets cache specifically
  process.exit();
});

// Export the app for testing
module.exports = app;

