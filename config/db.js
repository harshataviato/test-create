/**
 * @module db
 * @description This module handles the connection to the MongoDB database using Mongoose.
 * It provides functions to connect and disconnect from the database, adapting to different environments.
 */

const mongoose = require('mongoose');

/**
 * Establishes a connection to the MongoDB database.
 * The connection URI is retrieved from environment variables, using a specific test URI if NODE_ENV is 'test'.
 * If the connection fails, the process exits.
 * @async
 * @function connectDB
 * @returns {Promise<void>} A promise that resolves when the connection is successful, or rejects if it fails.
 */
const connectDB = async () => {
  // Use a different URI for the test environment to ensure data isolation
  const mongoURI = process.env.NODE_ENV === 'test' ? process.env.MONGO_URI_TEST : process.env.MONGO_URI;

  if (!mongoURI) {
    console.error("MongoDB URI is not defined. Please set MONGO_URI (and MONGO_URI_TEST for testing) in your .env file.");
    // Exit process if URI is not configured, as DB connection is critical
    process.exit(1);
  }

  try {
    // Attempt to connect to MongoDB using the determined URI
    const conn = await mongoose.connect(mongoURI, {
      // These options are recommended by Mongoose to avoid deprecation warnings
      // and ensure stable connection behavior.
      useNewUrlParser: true,      // Use the new URL parser
      useUnifiedTopology: true    // Use the new server discovery and monitoring engine
    });

    console.log(`MongoDB Connected [${process.env.NODE_ENV || 'development'}]: ${conn.connection.host}`); // Log successful connection
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`); // Log any connection errors
    process.exit(1); // Exit the process with a failure code
  }
};

/**
 * Disconnects from the MongoDB database.
 * Useful for ensuring clean state in testing environments.
 * @async
 * @function disconnectDB
 * @returns {Promise<void>} A promise that resolves when the disconnection is successful.
 */
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log(`MongoDB Disconnected [${process.env.NODE_ENV || 'development'}]`);
  } catch (error) {
    console.error(`Error disconnecting from MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Export both functions
module.exports = { connectDB, disconnectDB };
