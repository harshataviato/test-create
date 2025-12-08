/**
 * @module main
 * @description
 * Entry point for the PetClinic TypeScript application.
 * Initializes the Express server and connects to the database.
 */

import "reflect-metadata"; // Required for TypeORM and class-validator
import dotenv from 'dotenv';
import { AppDataSource } from './config/data-source';
import { app } from './app';
import { Constants } from './utils/constants';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const port = process.env.PORT || Constants.DEFAULT_PORT;

/**
 * Main function to start the application.
 * Connects to the database and then starts the Express server.
 */
async function startApplication(): Promise<void> {
  try {
    await AppDataSource.initialize();
    console.log("Data Source has been initialized!");

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
      console.log('To stop the server, press Ctrl+C');
    });
  } catch (error) {
    console.error("Error during Data Source initialization:", error);
    process.exit(1); // Exit with a failure code
  }
}

// Call the main function to start the application
startApplication();

