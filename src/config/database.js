/**
 * Database Configuration using Sequelize.
 * Defaults to SQLite for local development simplicity.
 */
const Sequelize = require('sequelize');

// You can swap this connection string for MySQL or Postgres based on env vars
// const sequelize = new Sequelize('petclinic', 'user', 'pass', { dialect: 'mysql' });

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './petclinic.sqlite', // File-based DB
  logging: false // Disable logging SQL queries to console for cleanliness
});

module.exports = sequelize;
