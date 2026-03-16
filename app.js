/**
 * Main entry point for the Node.js application.
 * Sets up the Express server and routes.
 */
const express = require('express');
const path = require('path');
const helloController = require('./controllers/helloController');

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/**
 * Routes
 */

// Route for the main page - mapped to the controller
app.get('/', helloController.index);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

module.exports = app; // Export for testing purposes
