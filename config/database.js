const { Sequelize } = require('sequelize');

/**
 * Database configuration using SQLite for simplicity and portability.
 * In a production Google environment, we would use Cloud Spanner or Cloud SQL.
 */
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false // Set to console.log to see SQL queries
});

module.exports = sequelize;
