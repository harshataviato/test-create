/**
 * @file This is the main entry point for the harshataviato-test-create-ebb4653 Node.js application.
 * It sets up the Express server, connects to the database, configures middleware,
 * and mounts the application routes.
 */

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');

// Import database connection configuration
const connectDB = require('./config/db');

// Import routes
const productRoutes = require('./routes/productRoutes');
const indexRoutes = require('./routes/indexRoutes');

// Initialize the Express application
const app = express();
const PORT = process.env.PORT || 3000; // Use port from .env or default to 3000

// Connect to MongoDB
connectDB();

/**
 * Middleware Setup
 * These functions process incoming requests before they reach the route handlers.
 */

// Serve static files from the 'public' directory (CSS, JS, images)
// E.g., requests for /css/style.css will serve from public/css/style.css
app.use(express.static(path.join(__dirname, 'public')));

// Parse URL-encoded data (e.g., form submissions)
// { extended: true } allows for rich objects and arrays to be encoded into the URL-encoded format
app.use(bodyParser.urlencoded({ extended: true }));

// Override HTTP methods using a query parameter (_method)
// This allows forms to send PUT or DELETE requests, as HTML forms only support GET and POST natively.
// E.g., <form method="POST" action="/products/1?_method=PUT">
app.use(methodOverride('_method'));

// Set the view engine to EJS
// EJS (Embedded JavaScript) allows embedding plain JavaScript in templates to render HTML.
app.set('view engine', 'ejs');
// Specify the directory where EJS template files are located
app.set('views', path.join(__dirname, 'views'));

/**
 * Route Handlers
 * Define specific paths for different parts of the application.
 */

// Mount product routes under the '/products' path
// All routes defined in productRoutes will be prefixed with '/products'
app.use('/products', productRoutes);

// Mount index routes for the root path
// This handles the home page and any other top-level routes
app.use('/', indexRoutes);

/**
 * Error Handling Middleware
 * This catches any errors that occur during request processing.
 */
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack to the console
  // Render an error page for the user, indicating a server-side issue
  res.status(500).render('error', { message: 'Something went wrong!', error: err });
});

// Start the server and listen for incoming requests on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
