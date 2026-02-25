/**
 * @fileoverview Database configuration for Sequelize ORM.
 * This file sets up the Sequelize instance, connects to the database,
 * and defines the configuration for different database dialects.
 */

require('dotenv').config(); // Load environment variables
const { Sequelize } = require('sequelize'); // Import Sequelize

// Determine database dialect from environment variables, default to sqlite
const dialect = process.env.DB_DIALECT || 'sqlite';
const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT; // Port should be explicitly set for MySQL/Postgres
const database = process.env.DB_NAME || 'petclinic';
const username = process.env.DB_USER || '';
const password = process.env.DB_PASS || '';
const storage = process.env.DB_STORAGE || 'database.sqlite'; // For SQLite, specify storage path

let sequelize;

/**
 * Database configuration options based on the chosen dialect.
 * Each dialect requires specific connection parameters.
 */
const dbConfig = {
    host,
    dialect,
    logging: console.log, // Enable logging of SQL queries to console
    pool: { // Connection pool settings
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};

switch (dialect) {
    case 'sqlite':
        sequelize = new Sequelize({
            ...dbConfig,
            storage: storage // SQLite needs a storage path for the database file
        });
        console.log(`Configured for SQLite: ${storage}`);
        break;
    case 'mysql':
        if (!port) {
            console.error('DB_PORT is required for MySQL.');
            process.exit(1);
        }
        sequelize = new Sequelize(database, username, password, {
            ...dbConfig,
            port: parseInt(port)
        });
        console.log(`Configured for MySQL: ${username}@${host}:${port}/${database}`);
        break;
    case 'postgres':
        if (!port) {
            console.error('DB_PORT is required for PostgreSQL.');
            process.exit(1);
        }
        sequelize = new Sequelize(database, username, password, {
            ...dbConfig,
            port: parseInt(port)
        });
        console.log(`Configured for PostgreSQL: ${username}@${host}:${port}/${database}`);
        break;
    default:
        console.error(`Unsupported DB_DIALECT: ${dialect}`);
        process.exit(1);
}

module.exports = sequelize; // Export the configured Sequelize instance
