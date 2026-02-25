/**
 * @file config.js
 * @description Centralized configuration file for the Node.js PetClinic application.
 * It loads environment variables and provides database connection settings.
 * This file replaces the information found in Spring's application.properties.
 * @author Google Senior Engineer
 */

require('dotenv').config(); // Ensure environment variables are loaded

module.exports = {
  /**
   * @property {object} development - Configuration for the development environment.
   */
  development: {
    username: process.env.DB_USER || 'petclinic',
    password: process.env.DB_PASSWORD || 'petclinic',
    database: process.env.DB_NAME || 'petclinic',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432, // Default to PostgreSQL port
    dialect: process.env.DB_DIALECT || 'postgres', // Default to PostgreSQL
    logging: console.log, // Enable logging of SQL queries to console
    // dialectOptions can be used for specific database configurations, e.g., SSL for Postgres
    // dialectOptions: {
    //   ssl: {
    //     require: true,
    //     rejectUnauthorized: false // Adjust based on your SSL certificate setup
    //   }
    // }
  },
  /**
   * @property {object} test - Configuration for the test environment.
   * Typically, a separate database or in-memory database is used for testing.
   */
  test: {
    username: process.env.DB_USER || 'petclinic',
    password: process.env.DB_PASSWORD || 'petclinic',
    database: process.env.DB_NAME_TEST || 'petclinic_test', // Use a separate test database
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: false, // Disable logging during tests for cleaner output
  },
  /**
   * @property {object} production - Configuration for the production environment.
   * This should use robust and secure database settings.
   */
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    logging: false, // Disable verbose logging in production
    // Consider adding more robust dialectOptions for production, e.g., connection pools
    // pool: {
    //   max: 5,
    //   min: 0,
    //   acquire: 30000,
    //   idle: 10000
    // }
  }
};
