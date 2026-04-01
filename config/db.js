/**
 * @module db
 * @description This module handles the connection to the MongoDB database using Mongoose.
 */

const mongoose = require('mongoose');

/**
 * Establishes a connection to the MongoDB database.
 * The connection URI is retrieved from environment variables.
 * If the connection fails, the process exits.
 * @async
 * @function connectDB
 * @returns {Promise<void>} A promise that resolves when the connection is successful, or rejects if it fails.
 */
const connectDB = async () => {
  try {
    // Attempt to connect to MongoDB using the URI from environment variables
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options are recommended by Mongoose to avoid deprecation warnings
      // and ensure stable connection behavior.
      useNewUrlParser: true,      // Use the new URL parser
      useUnifiedTopology: true    // Use the new server discovery and monitoring engine
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`); // Log successful connection
  } catch (error) {
    console.error(`Error: ${error.message}`); // Log any connection errors
    process.exit(1); // Exit the process with a failure code
  }
};

module.exports = connectDB; // Export the connectDB function for use in app.js
