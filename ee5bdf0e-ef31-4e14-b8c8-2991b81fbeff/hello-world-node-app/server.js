/**
 * @module server
 * @description
 * This is the main entry point for the Hello World Node.js application.
 * It sets up the Express server, configures the view engine,
 * and defines the primary routes.
 */

const express = require('express'); // Import the Express.js framework to build the web application
const path = require('path');       // Import the 'path' module for working with file and directory paths

const indexRoutes = require('./src/routes/index.routes'); // Import the routes defined for the application

// Initialize the Express application
const app = express();

// Define the port the server will listen on.
// It tries to use the PORT environment variable (e.g., for deployment) or defaults to 3000.
const PORT = process.env.PORT || 3000;

/**
 * @function setupViewEngine
 * @description
 * Configures the templating engine for the application.
 * This application uses EJS (Embedded JavaScript) as its view engine.
 * Views are located in the `src/views` directory.
 */
function setupViewEngine() {
  // Set EJS as the template engine
  app.set('view engine', 'ejs');
  // Specify the directory where the view templates are located
  app.set('views', path.join(__dirname, 'src', 'views'));
}

/**
 * @function setupRoutes
 * @description
 * Registers all the route handlers with the Express application.
 * The indexRoutes handle the root URL ('/').
 */
function setupRoutes() {
  // Use the imported indexRoutes for the root path.
  // All requests starting with '/' will be handled by indexRoutes.
  app.use('/', indexRoutes);
}

/**
 * @function startServer
 * @description
 * Starts the Express server and makes it listen for incoming requests
 * on the defined port.
 */
function startServer() {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Access it via: http://localhost:${PORT}`);
  });
}

// --- Main Application Flow ---
// 1. Configure the view engine
setupViewEngine();

// 2. Set up the application routes
setupRoutes();

// 3. Start the server
startServer();
