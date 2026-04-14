/**
 * @module app
 * @description Main entry point for the Hello World Node.js application.
 * This file sets up the Express.js server, configures the view engine,
 * defines the application routes, and starts the server listening for requests.
 */

const express = require('express');   // Import the Express framework for building web applications
const path = require('path');         // Import the 'path' module to handle and transform file paths
const messageController = require('./controllers/messageController'); // Import our custom message controller

const app = express();               // Create an instance of the Express application
const PORT = process.env.PORT || 3000; // Define the port number the server will listen on.
                                      // It first tries to use the PORT environment variable,
                                      // otherwise, it defaults to 3000.

// --- Application Configuration ---

// Set the view engine to EJS (Embedded JavaScript).
// EJS allows us to use JavaScript to generate HTML markup, making templates dynamic.
app.set('view engine', 'ejs');
// Specify the directory where our EJS view templates are located.
// `path.join(__dirname, 'views')` constructs an absolute path to the 'views' folder
// relative to the current file (`app.js`).
app.set('views', path.join(__dirname, 'views'));

// --- Routes ---

/**
 * Define a route handler for the root URL ("/").
 * When a GET request comes to http://localhost:PORT/,
 * it will be handled by the `renderHelloWorld` function from our message controller.
 */
app.get('/', messageController.renderHelloWorld);

// --- Error Handling (Good Practice) ---

/**
 * Middleware to catch 404 Not Found errors.
 * This catches any request that didn't match a defined route above.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function in the stack.
 * @returns {void}
 */
app.use((req, res, next) => {
    // Set the HTTP status code to 404 (Not Found)
    res.status(404).send("<h1>404</h1><p>Sorry, that route doesn't exist.</p>");
});

// --- Start the Server ---

/**
 * Start the Express server and listen for incoming HTTP requests on the specified port.
 * Once the server is successfully started, a callback function is executed to log a message
 * indicating the server's status and access URL.
 */
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('To see "Hello world!", open your browser and navigate to the address above.');
});
