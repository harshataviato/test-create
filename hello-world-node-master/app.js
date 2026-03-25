/**
 * @file app.js
 * @description Main entry point for the Hello World Node.js application.
 *              Sets up the Express server, configures view engine, and registers routes.
 */

// Import the Express framework
const express = require('express');
// Import the path module to work with file and directory paths
const path = require('path');
// Import the application routes
const indexRouter = require('./routes/index');

// Create an Express application instance
const app = express();
// Define the port the server will listen on. Use the environment variable PORT if available, otherwise default to 3000.
const PORT = process.env.PORT || 3000;

// --- View Engine Setup ---
// Configure EJS as the template engine for rendering dynamic content.
app.set('view engine', 'ejs');
// Specify the directory where EJS template files are located.
// `path.join(__dirname, 'views')` ensures that the path is resolved correctly regardless of where the script is run.
app.set('views', path.join(__dirname, 'views'));

// --- Middleware Setup ---
// Serve static files (like CSS, JavaScript, images) from the 'public' directory.
// This allows assets to be accessed directly via URLs like /css/style.css.
app.use(express.static(path.join(__dirname, 'public')));

// --- Route Setup ---
// Register the main router for handling incoming requests.
// All requests to the root path '/' will be handled by the indexRouter.
app.use('/', indexRouter);

// --- Server Start ---
// Start the Express server and listen for incoming requests on the specified port.
app.listen(PORT, () => {
  // Log a message to the console once the server has successfully started,
  // indicating the address where it can be accessed.
  console.log(`Server is running on http://localhost:${PORT}`);
});

