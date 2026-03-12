const express = require('express');
const path = require('path');
const helloController = require('./controllers/HelloController');

/**
 * Main application entry point.
 * Configures the Express server, middleware, and routing.
 */
const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the template engine for the View layer
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware for static files (if needed in future)
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Route Definitions
 */
// Map the root URL to the Controller action
app.get('/', (req, res) => helloController.renderHelloWorld(req, res));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
