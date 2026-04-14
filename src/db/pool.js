/**
 * @file Database connection pool configuration.
 * @description Centralized module for managing PostgreSQL database connections using `pg` library.
 * It reads database configuration from `config/index.js` and exports a Pool instance.
 * @author Google Senior Engineer
 */

const { Pool } = require('pg');
const config = require('../config');

// Create a new PostgreSQL connection pool
const pool = new Pool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  port: config.db.port,
  // Optional: SSL configuration if required by your PostgreSQL setup (e.g., on Heroku)
  ssl: config.db.ssl ? { rejectUnauthorized: false } : false
});

// Event listener for database connection errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1); // Exit the process if a fatal database error occurs
});

/**
 * Executes a SQL query using the connection pool.
 * @param {string} text - The SQL query string.
 * @param {Array<any>} [params] - An array of parameters to be used in the query.
 * @returns {Promise<import('pg').QueryResult>} - A Promise that resolves to the query result.
 */
async function query(text, params) {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error; // Re-throw the error for upstream handling
  }
}

// Export the query function for use in repositories
module.exports = {
  query,
};
