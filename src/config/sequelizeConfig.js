/**
 * @file sequelizeConfig.js
 * @description Configuration file for Sequelize CLI.
 * This file is used by the `sequelize-cli` to connect to the database
 * for migrations and seeders.
 */

require('dotenv').config(); // Load environment variables

module.exports = {
  development: {
    url: process.env.DATABASE_URL || 'postgres://petclinic:petclinic@localhost:5432/petclinic',
    dialect: 'postgres',
    migrationStorageTableName: 'sequelize_meta',
    seederStorageTableName: 'sequelize_data',
    // Options for the pg client library
    dialectOptions: {
      // ssl: {
      //   require: true,
      //   rejectUnauthorized: false // Use 'true' in production with valid certificates
      // }
    }
  },
  production: {
    url: process.env.DATABASE_URL, // DATABASE_URL should be set in production environment
    dialect: 'postgres',
    migrationStorageTableName: 'sequelize_meta',
    seederStorageTableName: 'sequelize_data',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Set to true if you have a valid certificate
      }
    }
  }
};
