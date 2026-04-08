// Load environment variables from .env file
require('dotenv').config();

// Import necessary modules
const express = require('express');
const path = require('path');
const { sequelize, syncDatabase, seedDatabase } = require('./config/database'); // Import sequelize instance and sync/seed functions
const productRoutes = require('./routes/productRoutes'); // Import product routes

// Create an Express application instance
const app = express();

// --- Middleware Setup ---

// Set EJS as the templating engine
app.set('view engine', 'ejs');
// Specify the directory where template files are located
app.set('views', path.join(__dirname, 'views'));

// Serve static files (CSS, JS, images, etc.) from the 'public' directory
// This makes files accessible via '/css/style.css', '/js/main.js' etc.
app.use(express.static(path.join(__dirname, 'public')));

// Parse URL-encoded bodies (for form submissions)
// This middleware populates `req.body` with the parsed form data
app.use(express.urlencoded({ extended: true }));

// --- Database Initialization Function ---

/**
 * Initializes the database connection and synchronizes models.
 * If the application is started directly, it will perform a database sync.
 * This function also handles seeding if specified in CLI arguments.
 */
async function initializeDatabase() {
  try {
    // Authenticate with the database to ensure connection is established
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Synchronize all models with the database (creates tables if they don't exist)
    // `syncDatabase` is imported from config/database.js
    await syncDatabase();
    console.log('Database synchronized: All models were synchronized successfully.');

    // Check for CLI argument to seed the database, but only if run as main app
    if (require.main === module && process.argv.includes('seed')) {
      await seedDatabase();
      console.log('Database seeded with initial data.');
    }
  } catch (error) {
    console.error('Unable to connect to the database or synchronize models:', error);
    // In a test environment, re-throw the error for the test runner to catch
    if (process.env.NODE_ENV === 'test') {
      throw error;
    }
    // Exit the process if database connection fails, as the app can't function without it
    process.exit(1);
  }
}

// --- Routes Setup ---

// Mount the product routes under the '/products' path
// All routes defined in productRoutes.js will be prefixed with '/products'
app.use('/products', productRoutes);

// Define a root route that redirects to the products list page
app.get('/', (req, res) => {
  // Redirect to the '/products' endpoint
  res.redirect('/products');
});

// --- Error Handling (404 Not Found) ---
// This middleware catches requests that don't match any defined routes.
app.use((req, res, next) => {
  res.status(404).render('404', { title: 'Page Not Found' }); // Renders a generic 404 page (assuming '404.ejs' exists)
});

// --- Global Error Handling Middleware ---
// This middleware catches any errors passed from previous middleware or route handlers.
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack to the console for debugging
  // Render an error page with a 500 status code
  res.status(500).render('error', { title: 'Server Error', message: err.message }); // Renders a generic error page (assuming 'error.ejs' exists)
});


// Export app and initializeDatabase for testing
module.exports = { app, initializeDatabase };

// --- Start the Server (only if app.js is executed directly) ---
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  initializeDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log('Press Ctrl-C to terminate.');
    });
  }).catch(err => {
    console.error('Failed to initialize database and start server:', err);
    process.exit(1);
  });
}
