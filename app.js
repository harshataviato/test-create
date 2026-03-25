/**
 * @module app
 * @description
 * Main application entry point for the "Hello World" Node.js web server.
 * Sets up the Express application, configures the view engine, and defines routes.
 */

const express = require('express'); // Import the Express framework
const path = require('path');       // Import the path module for working with file and directory paths
const helloController = require('./controllers/helloController'); // Import the helloController

const app = express(); // Create an instance of the Express application
const port = 3000;     // Define the port number the server will listen on

// --- Application Configuration ---

/**
 * Configure EJS as the view engine for rendering dynamic HTML templates.
 * @see {@link https://ejs.co/}
 */
app.set('view engine', 'ejs');

/**
 * Specify the directory where the view templates are located.
 * `path.join(__dirname, 'views')` constructs an absolute path to the 'views' folder
 * relative to the current script's directory.
 */
app.set('views', path.join(__dirname, 'views'));

// --- Route Definitions ---

/**
 * Defines the route for the root URL ('/').
 * When a GET request is made to the root, it is handled by the `getHomePage`
 * method of the `helloController`.
 */
app.get('/', helloController.getHomePage);

// --- Server Startup ---

/**
 * Starts the Express server and listens for incoming requests on the specified port.
 * Once the server is successfully started, a callback function is executed
 * to log a message to the console, indicating the server's status and access URL.
 */
app.listen(port, () => {
  // Log message to console once the server starts listening
  console.log(`Server is running on http://localhost:${port}`);
});
