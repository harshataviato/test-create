const express = require('express');
const path = require('path');
const helloController = require('./controllers/helloController');

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Express Configuration
 */

// Set EJS as the templating engine for the View layer
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/**
 * Routes
 */

// Define the root route and map it to the controller logic
app.get('/', helloController.index);

/**
 * Server Start
 */
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

module.exports = app; // Export for testing purposes
