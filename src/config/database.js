/**
 * @file src/config/database.js
 * @description Configures and initializes the Sequelize ORM for connecting to the PostgreSQL database.
 * This file replaces parts of `application.properties` and the database setup in the Java version.
 * It also includes logic for seeding initial data based on the SQL files.
 */

const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

/**
 * @constant {Sequelize} sequelize
 * @description Initializes the Sequelize instance with database connection details
 * from environment variables.
 */
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres', // Using PostgreSQL
    logging: process.env.NODE_ENV === 'development' ? console.log : false, // Log SQL queries in dev
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

/**
 * @async @function authenticate
 * @description Tests the database connection.
 * @returns {Promise<void>} A promise that resolves if the connection is successful,
 *   otherwise rejects with an error.
 */
async function authenticate() {
  return sequelize.authenticate();
}

/**
 * @async @function sync
 * @description Synchronizes all defined models with the database.
 * @param {object} options - Options to pass to `sequelize.sync()`.
 *   E.g., `{ alter: true }` to apply schema changes, `{ force: true }` to drop and recreate tables.
 * @returns {Promise<void>} A promise that resolves when models are synchronized.
 */
async function sync(options = {}) {
  await sequelize.sync(options);
}

/**
 * @async @function seedData
 * @description Seeds initial data into the database from SQL files.
 * This function checks if the `owners` table exists before seeding to prevent
 * duplicate data on multiple runs, making it idempotent.
 *
 * It mimics the `data.sql` and `schema.sql` initialization.
 */
async function seedData() {
  try {
    // Check if the database has any tables created (e.g., the 'owners' table)
    const [results] = await sequelize.query(
      "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public' AND tablename = 'owners';"
    );

    if (results.length === 0) {
      console.log('Database appears empty. Seeding schema and data...');

      // Read and execute schema.sql
      const schemaSqlPath = path.join(__dirname, '../db/postgres/schema.sql');
      const schemaSql = fs.readFileSync(schemaSqlPath, 'utf8');
      await sequelize.query(schemaSql);
      console.log('Schema.sql executed successfully.');

      // Read and execute data.sql
      const dataSqlPath = path.join(__dirname, '../db/postgres/data.sql');
      const dataSql = fs.readFileSync(dataSqlPath, 'utf8');
      await sequelize.query(dataSql);
      console.log('Data.sql executed successfully.');

      console.log('Initial data seeded successfully.');
    } else {
      console.log('Database already contains data, skipping seeding.');
    }
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
}

/**
 * @function getSequelize
 * @description Returns the configured Sequelize instance.
 * @returns {Sequelize} The Sequelize instance.
 */
function getSequelize() {
  return sequelize;
}

module.exports = {
  authenticate,
  sync,
  seedData,
  getSequelize
};
