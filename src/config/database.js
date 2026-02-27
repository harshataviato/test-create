const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Pluggable Persistence Layer
 * Configures Sequelize based on environment variables.
 * Supports SQLite for local dev, PostgreSQL/MySQL for production.
 */
const sequelize = new Sequelize({
  dialect: process.env.DB_DIALECT || 'sqlite',
  storage: process.env.DB_STORAGE || './database.sqlite',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: false, // Set to console.log for debugging SQL
  define: {
    timestamps: true
  }
});

module.exports = sequelize;
