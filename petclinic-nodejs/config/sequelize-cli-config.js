/**
 * @fileoverview Configuration file for Sequelize CLI.
 * This file provides database connection settings for migrations and seeders,
 * allowing Sequelize CLI to interact with the database specified in `.env`.
 */

require('dotenv').config(); // Load environment variables from .env file

const dialect = process.env.DB_DIALECT || 'sqlite';
const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT;
const database = process.env.DB_NAME || 'petclinic';
const username = process.env.DB_USER || '';
const password = process.env.DB_PASS || '';
const storage = process.env.DB_STORAGE || 'database.sqlite';

const config = {
  dialect: dialect,
  host: host,
  username: username,
  password: password,
  database: database,
  port: port ? parseInt(port) : undefined, // Ensure port is an integer if provided
  logging: console.log, // Enable logging of SQL queries
  // Specific configurations per dialect if needed by CLI (e.g., SQLite storage)
  ...(dialect === 'sqlite' && { storage: storage })
};

module.exports = {
  development: config,
  test: config,
  production: config
};
