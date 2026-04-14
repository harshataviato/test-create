/**
 * @file Application configuration.
 * @description Centralized configuration for database, server, and other application settings.
 * Environment variables are prioritized.
 * @author Google Senior Engineer
 */

require('dotenv').config(); // Load environment variables from .env file

const config = {
  // Server configuration
  port: process.env.PORT || 8080, // Application port, defaults to 8080

  // Database configuration (PostgreSQL)
  db: {
    host: process.env.DB_HOST || 'localhost',    // Database host
    user: process.env.DB_USER || 'petclinic',    // Database user
    password: process.env.DB_PASSWORD || 'petclinic', // Database password
    database: process.env.DB_NAME || 'petclinic',    // Database name
    port: process.env.DB_PORT || 5432,           // Database port
    ssl: process.env.DB_SSL === 'true'           // Enable SSL for database connection
  },

  // Session configuration
  session: {
    secret: process.env.SESSION_SECRET || 'supersecretkey', // Secret for session cookie signing
    cookieMaxAge: parseInt(process.env.SESSION_COOKIE_MAX_AGE || '3600000', 10) // 1 hour in milliseconds
  },

  // Internationalization (i18n) configuration
  i18n: {
    locales: ['en', 'de', 'es', 'fa', 'ko', 'pt', 'ru', 'tr'], // Supported locales
    directory: './messages', // Directory containing translation files (relative to current file)
    defaultLocale: 'en', // Default locale if not specified
    queryParameter: 'lang' // URL query parameter for changing locale
  },

  // Pagination settings for owner and vet lists
  pagination: {
    pageSize: 5 // Number of items per page
  }
};

module.exports = config;

