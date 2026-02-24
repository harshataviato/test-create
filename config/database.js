/**
 * Database Configuration
 * 
 * Uses Sequelize to connect to the database.
 * Defaults to SQLite (in-memory/file) to mimic H2.
 * Can be configured for MySQL or Postgres via environment variables.
 */
const { Sequelize } = require('sequelize');
const path = require('path');

let sequelize;

// Check environment variables for database selection
// Similar to application.properties profiles
if (process.env.DATABASE === 'mysql') {
  sequelize = new Sequelize(
    process.env.MYSQL_DATABASE || 'petclinic',
    process.env.MYSQL_USER || 'petclinic',
    process.env.MYSQL_PASSWORD || 'petclinic',
    {
      host: process.env.MYSQL_HOST || 'localhost',
      dialect: 'mysql',
      logging: false
    }
  );
} else if (process.env.DATABASE === 'postgres') {
  sequelize = new Sequelize(
    process.env.POSTGRES_DB || 'petclinic',
    process.env.POSTGRES_USER || 'petclinic',
    process.env.POSTGRES_PASSWORD || 'petclinic',
    {
      host: process.env.POSTGRES_HOST || 'localhost',
      dialect: 'postgres',
      logging: false
    }
  );
} else {
  // Default to SQLite (H2 equivalent)
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../petclinic.sqlite'),
    logging: false
  });
}

module.exports = sequelize;
