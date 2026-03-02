/**
 * Database Configuration Module.
 * 
 * Handles Multi-Database Support feature.
 * Uses Environment variables to switch between SQLite (default/H2 equiv), MySQL, and PostgreSQL.
 */

const Sequelize = require('sequelize');
const path = require('path');

// Determine database dialect from environment variable, default to 'sqlite'
const dialect = process.env.DB_DIALECT || 'sqlite';

let sequelize;

console.log(`[System] Initializing database with dialect: ${dialect}`);

if (dialect === 'sqlite') {
  // SQLite configuration (H2 equivalent for Node)
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || path.join(__dirname, '../../database.sqlite'),
    logging: false // Disable console logging for cleaner output
  });
} else {
  // MySQL or PostgreSQL configuration
  sequelize = new Sequelize(
    process.env.DB_NAME || 'petclinic',
    process.env.DB_USER || 'root',
    process.env.DB_PASS || 'password',
    {
      host: process.env.DB_HOST || 'localhost',
      dialect: dialect,
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
}

module.exports = sequelize;
