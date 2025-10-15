const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

/**
 * Root route - returns a simple greeting.
 * @route GET /
 * @returns {string} - "Hello, World!"
 */
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

/**
 * Health check route - indicates server operational status.
 * @route GET /health
 * @returns {string} - "OK"
 */
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Export the app for testing purposes
module.exports = app;

// Start the server only if this file is run directly (not imported as a module)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}
