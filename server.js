/**
 * @fileoverview Entry point for starting the PetClinic Node.js application.
 * This file imports the Express app configuration from `app.js` and starts the server
 * on a specified port, typically 3000.
 */

const app = require('./app'); // Import the configured Express application

// Define the port the server will listen on
const PORT = process.env.PORT || 3000;

/**
 * @function startServer
 * @description Starts the Express server and listens for incoming requests on the configured port.
 * Logs a message to the console indicating the server's status.
 */
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access the application at http://localhost:${PORT}/`);
});

