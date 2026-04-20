const express = require('express');
const path = require('path');
const helloController = require('./controllers/helloController');

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Middleware & Configuration
 */
// Set EJS as the view engine for rendering HTML templates
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files if needed (placeholder for future CSS/JS)
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Routing Logic
 */

// Route for the web view
app.get('/', helloController.renderHello);

// Route for the REST API endpoint
app.get('/api/hello', helloController.getHelloJson);

/**
 * Server Initialization
 */
app.listen(PORT, () => {
  console.log(`----------------------------------------`);
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Pragmatic Node.js HelloWorld ready.`);
  console.log(`----------------------------------------`);
});
