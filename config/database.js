/**
 * Database Configuration using Sequelize.
 * 
 * Defaults to SQLite (In-Memory behavior via file) to match H2 default.
 * Can switch to MySQL/Postgres via Environment Variables.
 */
const Sequelize = require('sequelize');

let sequelize;

if (process.env.DATABASE === 'mysql') {
    sequelize = new Sequelize(
        process.env.MYSQL_DATABASE || 'petclinic',
        process.env.MYSQL_USER || 'petclinic',
        process.env.MYSQL_PASSWORD || 'petclinic',
        {
            host: 'localhost',
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
            host: 'localhost',
            dialect: 'postgres',
            logging: false
        }
    );
} else {
    // Default: SQLite (persisted to file for this demo, usually :memory: for tests)
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: 'petclinic.sqlite',
        logging: false
    });
}

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Models will be attached here in models/index.js
module.exports = db;
