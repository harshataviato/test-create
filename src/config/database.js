/**
 * Database Configuration
 * 
 * Configures the Sequelize connection. Defaults to SQLite for easy local setup,
 * but supports MySQL and PostgreSQL via environment variables, mirroring the 
 * Spring Profiles functionality.
 */
const { Sequelize } = require('sequelize');
const path = require('path');

const dbType = process.env.DATABASE || 'sqlite'; // 'mysql', 'postgres', or 'sqlite'

let sequelize;

if (dbType === 'sqlite') {
  // Use SQLite for in-memory/file-based development (Simulates H2)
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.SQLITE_PATH || path.join(__dirname, '../../petclinic.sqlite'),
    logging: false // Toggle to true to see SQL queries
  });
} else {
  // Configuration for MySQL or PostgreSQL
  sequelize = new Sequelize(
    process.env.DB_NAME || 'petclinic',
    process.env.DB_USER || 'petclinic',
    process.env.DB_PASS || 'petclinic',
    {
      host: process.env.DB_HOST || 'localhost',
      dialect: dbType === 'mysql' ? 'mysql' : 'postgres',
      port: process.env.DB_PORT || (dbType === 'mysql' ? 3306 : 5432),
      logging: false
    }
  );
}

module.exports = sequelize;
