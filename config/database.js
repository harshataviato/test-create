/**
 * Database Configuration using Sequelize.
 * Defaults to SQLite for ease of setup, similar to H2 in the Java version.
 * Can be configured for MySQL/Postgres via environment variables.
 */
const { Sequelize } = require('sequelize');
const path = require('path');

let sequelize;

if (process.env.DATABASE_URL) {
    // For Postgres/MySQL if provided
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        logging: false
    });
} else {
    // Default to SQLite file
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: path.join(__dirname, '..', 'petclinic.sqlite'),
        logging: false // Set to console.log to see SQL queries
    });
}

module.exports = sequelize;
