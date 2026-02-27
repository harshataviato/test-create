const { Sequelize } = require('sequelize');

/**
 * Senior Engineer Note: We use SQLite here to mirror the H2 'in-memory' 
 * experience of the original Spring app. In production, this would 
 * switch to Postgres or MySQL via environment variables.
 */
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './petclinic.sqlite',
  logging: false // Toggle this for SQL debugging
});

module.exports = sequelize;
