/**
 * @fileoverview Sequelize setup file.
 * This file initializes Sequelize, connects to the database, loads all defined models,
 * and sets up any associations between them.
 */

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process'); // Node.js process object to access environment variables
const basename = path.basename(__filename); // The current file name ('index.js')
const env = process.env.NODE_ENV || 'development'; // Determine the current environment
const config = require(__dirname + '/../config/config.js')[env]; // Load database config based on environment
const db = {}; // Object to hold all models and the sequelize instance

let sequelize;
// Check if a specific `use_env_variable` is defined in the config.
// This is common for production databases where connection string might be in an environment variable.
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  // Otherwise, use the direct config settings (e.g., for SQLite file paths)
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Read all model files from the current directory and load them into Sequelize.
fs
  .readdirSync(__dirname) // Read all files in the current directory
  .filter(file => {
    // Filter out 'index.js', hidden files, and non-.js files
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    // For each valid model file, import it and initialize with sequelize
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model; // Store the initialized model in the db object
  });

// Apply any model associations if they are defined.
// If a model has an `associate` method, call it to define relationships with other models.
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize; // Store the sequelize instance
db.Sequelize = Sequelize; // Store the Sequelize library (for DataTypes, Operators, etc.)

module.exports = db; // Export the db object containing all models and sequelize instance
