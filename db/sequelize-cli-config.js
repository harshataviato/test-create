/**
 * @fileoverview Configuration file for Sequelize CLI.
 * This file specifies the paths for migrations, seeders, and models,
 * as well as the database configuration.
 */

const path = require('path');

module.exports = {
  // Path to the configuration file that contains database connection details
  config: path.resolve(__dirname, 'config', 'config.json'),
  // Path to the directory where Sequelize migration files are stored
  'migrations-path': path.resolve(__dirname, 'migrations'),
  // Path to the directory where Sequelize seeder files are stored
  'seeders-path': path.resolve(__dirname, 'seeders'),
  // Path to the directory where Sequelize model definitions are stored
  // This is used by `sequelize-cli model:generate`
  'models-path': path.resolve(__dirname, '..', 'models')
};
