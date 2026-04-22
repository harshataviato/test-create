/**
 * Initializes Sequelize and aggregates models.
 * Equivalent to Hibernate/JPA Configuration in Java.
 */
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DATABASE_PATH || './database.sqlite',
    logging: false // Keep console clean
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import Models
db.Flight = require('./flight.model')(sequelize, DataTypes);

module.exports = db;
