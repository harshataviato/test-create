/**
 * @module server
 * @description The entry point for the PetClinic application.
 * It loads environment variables, starts the Express server, and listens for incoming requests.
 */

import app from './app';
import dotenv from 'dotenv';

// Load environment variables from .env file
// This ensures process.env.PORT is available
dotenv.config();

/**
 * @constant {number} PORT
 * @description The port number on which the Express server will listen.
 * Defaults to 8080 if not specified in environment variables.
 */
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;

/**
 * @function startServer
 * @description Starts the Express server and logs the listening port.
 */
const startServer = () => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Press Ctrl+C to quit.');
  });
};

// Start the server
startServer();
