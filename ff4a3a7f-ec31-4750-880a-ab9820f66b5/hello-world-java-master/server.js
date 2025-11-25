/**
 * @module server
 * @description Main entry point for the Hello World Express application.
 *              Sets up the Express server, configures the view engine,
 *              and defines application routes.
 */

const express = require('express');
const path = require('path');
const helloController = require('./controllers/helloController');

// Initialize the Express application
const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Configure the view engine.
 * Sets EJS (Embedded JavaScript) as the templating engine.
 * Views will be located in the 'views' directory.
 */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/**
 * Define application routes.
 * Routes map incoming HTTP requests to controller functions.
 */
// Route for the home page, handled by helloController.getHelloWorld
app.get('/', helloController.getHelloWorld);

/**
 * Start the server.
 * The application listens for incoming requests on the specified port.
 */
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop the server.');
});
