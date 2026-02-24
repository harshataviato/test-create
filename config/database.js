/**
 * Database configuration.
 * Adapts based on environment variables to support SQLite (default), MySQL, or Postgres.
 */
const path = require('path');

const env = process.env.NODE_ENV || 'development';
const dialect = process.env.DATABASE_DIALECT || 'sqlite'; // 'mysql', 'postgres', 'sqlite'

const config = {
  development: {
    dialect: dialect,
    storage: path.join(__dirname, '../petclinic.sqlite'), // Used for SQLite
    username: process.env.DB_USER || 'petclinic',
    password: process.env.DB_PASSWORD || 'petclinic',
    database: process.env.DB_NAME || 'petclinic',
    host: process.env.DB_HOST || 'localhost',
    logging: false // Set to console.log to see SQL queries
  },
  production: {
    dialect: dialect,
    use_env_variable: 'DATABASE_URL',
    logging: false
  }
};

module.exports = config[env];
