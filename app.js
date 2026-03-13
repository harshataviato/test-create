const express = require('express');
const path = require('path');
const helloController = require('./controllers/helloController');

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Express Configuration
 */

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/**
 * Routes
 */

// Define the main route and link it to the controller
app.get('/', helloController.index);

/**
 * Server Execution
 */
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop.');
});
