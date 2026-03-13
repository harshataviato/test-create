const express = require('express');
const path = require('path');
const helloController = require('./controllers/helloController');

/**
 * Entry point for the application.
 * Configures Express, middleware, and routes.
 */
const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to log requests (standard pragmatic practice)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routing
// Map the root URL to the controller method
app.get('/', (req, res) => helloController.renderHello(req, res));

// Initialize server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop.');
});
