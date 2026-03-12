/**
 * Main entry point for the Hello World application.
 * Configures the Express server, middleware, and routes.
 */
const express = require('express');
const path = require('path');
const HelloWorldController = require('./src/controllers/HelloWorldController');

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the template engine for the View layer
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

/**
 * Route definition
 * Maps the root URL to the HelloWorldController's index method
 */
app.get('/', HelloWorldController.index);

/**
 * Start the server
 */
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
