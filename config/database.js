/**
 * @fileoverview Sequelize database configuration.
 * This file sets up the connection to the PostgreSQL database using Sequelize.
 */

const { Sequelize } = require('sequelize');
const path = require('path');

// Determine the database environment (e.g., development, test, production)
const env = process.env.NODE_ENV || 'development';

// Load database configuration from a separate JSON file
// This allows for different configurations per environment
const configPath = path.resolve(__dirname, '../db/config/config.json');
const config = require(configPath)[env];

/**
 * @constant sequelize
 * @description Initializes a new Sequelize instance with the database configuration.
 * Uses environment variables for sensitive information like database URL, username, and password.
 * @type {Sequelize}
 */
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: process.env.NODE_ENV === 'development' ? console.log : false, // Enable logging in development
    define: {
      timestamps: false // Disable createdAt and updatedAt columns by default for all models
    }
  }
);

/**
 * @function testConnection
 * @description Tests the database connection and logs the result.
 */
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1); // Exit process if database connection fails
  }
}

// Call testConnection to verify database connectivity on startup
testConnection();

module.exports = sequelize;
