const { Sequelize } = require('sequelize');
const path = require('path');

// Determine database dialect based on environment variables or default to SQLite (like H2)
let sequelize;

if (process.env.MYSQL_URL) {
    // MySQL Configuration
    sequelize = new Sequelize(process.env.MYSQL_URL, {
        dialect: 'mysql',
        logging: false
    });
} else if (process.env.POSTGRES_URL) {
    // Postgres Configuration
    sequelize = new Sequelize(process.env.POSTGRES_URL, {
        dialect: 'postgres',
        logging: false
    });
} else {
    // Default SQLite (Development/In-Memory equivalent)
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: path.join(__dirname, '..', 'petclinic.sqlite'),
        logging: false
    });
}

module.exports = sequelize;
