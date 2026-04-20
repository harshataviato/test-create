const express = require('express');
const path = require('path');
const helloController = require('./controllers/helloController');

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Middleware & Configuration
 */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Routing Logic
 */
app.get('/', helloController.renderHello);
app.get('/api/hello', helloController.getHelloJson);

/**
 * Server Initialization
 * Wrapped in a check to prevent port collisions during testing
 */
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`----------------------------------------`);
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Pragmatic Node.js HelloWorld ready.`);
    console.log(`----------------------------------------`);
  });
}

// Export app for testing purposes
module.exports = app;
