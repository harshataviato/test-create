/**
 * @module server
 * @description Entry point for the PetClinic TypeScript application.
 *              Initializes the database connection, loads environment variables,
 *              and starts the Express server.
 */

import 'reflect-metadata'; // Required for TypeORM and class-validator
import dotenv from 'dotenv';
import { AppDataSource } from '@config/database';
import app from './app'; // Import the configured Express app

// Load environment variables from .env file
dotenv.config();

/**
 * @function startServer
 * @description Initializes the database connection and starts the Express server.
 * @returns {Promise<void>} A promise that resolves when the server is started.
 */
async function startServer(): Promise<void> {
  try {
    // Initialize TypeORM Data Source
    await AppDataSource.initialize();
    console.log('Database connection established successfully.');

    const PORT = process.env.PORT || 8080;

    // Start the Express application
    app.listen(PORT, () => {
      console.log(`PetClinic application started on port ${PORT}`);
      console.log(`Access it at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1); // Exit with a failure code
  }
}

// Execute the server startup function
startServer();
