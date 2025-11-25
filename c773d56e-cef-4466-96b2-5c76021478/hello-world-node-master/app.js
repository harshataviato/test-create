/**
 * @file app.js
 * @description This is the main entry point for the "Hello World" Node.js web application.
 * It sets up the Express server, configures the view engine, and defines the application routes.
 */

// Import the Express framework to create and manage the server
const express = require('express');
// Import the home controller which handles requests related to the home page
const homeController = require('./controllers/homeController');

/**
 * Creates an Express application instance.
 * This app object is used to set up middleware, define routes, and start the server.
 * @type {express.Application}
 */
const app = express();
/**
 * The port number on which the server will listen.
 * It defaults to 3000 if not specified in the environment variables.
 * @type {number}
 */
const PORT = process.env.PORT || 3000;

// --- View Engine Setup ---
/**
 * Sets EJS (Embedded JavaScript) as the template engine for rendering views.
 * EJS allows embedding JavaScript code directly into HTML templates.
 * @param {string} 'view engine' - The Express setting for the view engine.
 * @param {string} 'ejs' - The name of the template engine to use.
 */
app.set('view engine', 'ejs');
/**
 * Specifies the directory where the application's view templates are located.
 * Express will look for `.ejs` files in this directory.
 * @param {string} 'views' - The Express setting for the views directory.
 * @param {string} './views' - The relative path to the views directory.
 */
app.set('views', './views');

// --- Routes Definition ---
/**
 * Defines a route for the root URL '/'.
 * When a GET request is made to the root URL, it will be handled by the `renderHomePage`
 * function from the `homeController`. This function is responsible for fetching data
 * and rendering the appropriate view.
 * @param {string} '/' - The path for which this middleware function is used.
 * @param {Function} homeController.renderHomePage - The controller function to execute.
 */
app.get('/', homeController.renderHomePage);

// --- Server Start ---
/**
 * Starts the Express server and listens for incoming requests on the specified port.
 * Once the server is successfully started, a message is logged to the console
 * indicating the port it's listening on.
 * @param {number} PORT - The port number to listen on.
 * @param {Function} callback - A callback function executed once the server starts.
 */
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop the server.');
});
