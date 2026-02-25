/**
 * @fileoverview Entry point for starting the Node.js PetClinic server.
 * This file loads the Express application and starts it on a specified port.
 */

// Load environment variables from .env file
require('dotenv').config();

const app = require('./app'); // Import the configured Express application
const sequelize = require('./models').sequelize; // Import the Sequelize instance

const PORT = process.env.PORT || 3000; // Define the port, defaulting to 3000

/**
 * Synchronizes Sequelize models with the database and starts the Express server.
 *
 * @async
 * @function startServer
 * @returns {Promise<void>} A promise that resolves when the server starts.
 */
const startServer = async () => {
  try {
    // Authenticate with the database to ensure connection is established
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Note: Migrations are handled via `npm run db:migrate` and `npm run db:seed`
    // in the README for better control over schema changes and data seeding.
    // `sequelize.sync()` is not called here to avoid automatic schema changes on every app start.

    // Start the Express server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Application available at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database or start the server:', error);
    process.exit(1); // Exit with an error code if setup fails
  }
};

// Call the function to start the server
startServer();
