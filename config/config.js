/**
 * @fileoverview Configuration file for Sequelize ORM.
 * This file defines database connection settings for different environments (development, test, production).
 * For this example, SQLite is used, making configuration simple as it's a file-based database.
 */

// Path module for resolving file paths
const path = require('path');

/**
 * Sequelize configuration object for different environments.
 * @exports {object}
 */
module.exports = {
  /**
   * Development environment configuration.
   * This is typically used during active development.
   */
  development: {
    dialect: "sqlite", // Specifies the database dialect (e.g., 'mysql', 'postgres', 'sqlite', 'mssql')
    storage: path.join(__dirname, '../db/development.sqlite'), // Path to the SQLite database file
    logging: false // Set to true to log all SQL queries executed by Sequelize (useful for debugging)
  },
  /**
   * Test environment configuration.
   * Used for running automated tests.
   */
  test: {
    dialect: "sqlite",
    storage: path.join(__dirname, '../db/test.sqlite'), // Separate database for testing
    logging: false
  },
  /**
   * Production environment configuration.
   * Used when the application is deployed live.
   * Note: For production, a more robust database like PostgreSQL or MySQL is usually preferred.
   * Also, storing the database file within the application directory might not be ideal for scalability
   * or containerized deployments. Externalizing storage is often better.
   */
  production: {
    dialect: "sqlite",
    storage: path.join(__dirname, '../db/production.sqlite'), // Production database file
    logging: false // It's common to disable extensive logging in production for performance
  }
};
