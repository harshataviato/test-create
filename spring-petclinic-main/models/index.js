/**
 * @file models/index.js
 * @description Centralized file for initializing Sequelize and defining all models.
 * This file sets up the database connection, imports all model definitions,
 * and establishes associations between them. It is the Node.js equivalent
 * of package-info.java within Spring's model packages, bringing all domain
 * objects into a single cohesive unit for ORM.
 * @author Google Senior Engineer
 */

'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,
    dialectOptions: config.dialectOptions || {},
    define: {
      freezeTableName: true, // Prevent Sequelize from pluralizing table names
      underscored: true, // Use snake_case for column names
    }
  });
}

// Read all model files from the current directory and import them
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    // Import model and pass sequelize instance and DataTypes
    // The `require` statement loads the model definition function.
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model; // Store the model in the db object
  });

// Apply all model associations if they have an `associate` method
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize; // The Sequelize instance
db.Sequelize = Sequelize; // The Sequelize library

module.exports = db;
