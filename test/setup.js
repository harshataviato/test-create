/**
 * @fileoverview Global setup and teardown for the Mocha test suite.
 * This script ensures a clean test database environment before and after all tests.
 */

// Set the NODE_ENV to 'test' to use the test database configuration
process.env.NODE_ENV = 'test';

const db = require('../models'); // Import all models and the sequelize instance
const config = require('../db/config/config.json')['test']; // Get test database config
const migration = require('../db/migrations/20240101000000-create-base-schema');
const seeder = require('../db/seeders/20240101000001-seed-initial-data');
const { QueryInterface } = require('sequelize'); // Import QueryInterface for migration/seeder calls

// Use ejs-mate for layout handling in tests that render views
const engine = require('ejs-mate');
const app = require('../app');
app.engine('ejs', engine); // Register ejs-mate as the view engine

before(async function() {
  this.timeout(23000); // Increase timeout for database operations in before hook

  console.log('\n--- Setting up test environment ---');
  console.log(`Using database: ${config.database} on ${config.host}:${config.port}`);

  // Make sequelize instance and models globally available for tests
  global.sequelize = db.sequelize;
  global.models = db;
  global.app = app; // Make the express app globally available for supertest

  // Authenticate database connection
  try {
    await db.sequelize.authenticate();
    console.log('Test database connection established.');
  } catch (error) {
    console.error('Failed to connect to test database:', error.message);
    process.exit(1); // Exit if connection fails
  }

  // Get QueryInterface instance for manual migration/seeding
  const queryInterface = db.sequelize.getQueryInterface();

  // Drop all tables and recreate schema for a clean slate
  console.log('Dropping all tables...');
  // This is a more robust way to clear the public schema in PostgreSQL
  await db.sequelize.query('DROP SCHEMA public CASCADE;');
  await db.sequelize.query('CREATE SCHEMA public;');
  await db.sequelize.query('GRANT ALL ON SCHEMA public TO public;'); // Ensure default permissions

  // Run migrations to create table structures
  console.log('Running migrations...');
  await migration.up(queryInterface, db.sequelize);
  console.log('Migrations complete.');

  // Run seeders to populate initial data
  console.log('Seeding initial data...');
  await seeder.up(queryInterface, db.sequelize);
  console.log('Seeding complete.');

  console.log('--- Test environment setup complete ---');
});

after(async function() {
  this.timeout(10000); // Timeout for after hook

  console.log('\n--- Tearing down test environment ---');
  // Optional: Drop the schema again after all tests to ensure complete cleanup
  // await db.sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');

  // Close the database connection
  await db.sequelize.close();
  console.log('Test database connection closed.');
  console.log('--- Test environment teardown complete ---');
});

// Helper for cleaning tables between suites if needed (not used in this setup,
// as the global setup recreates the db each time for simplicity and full isolation)
/*
async function cleanAllTables() {
  for (const modelName in db) {
    if (db[modelName].sync && db[modelName].tableName) { // Check if it's a Sequelize model
      try {
        await db[modelName].destroy({ truncate: true, cascade: true });
        console.log(`Truncated table: ${db[modelName].tableName}`);
      } catch (error) {
        console.warn(`Could not truncate table ${db[modelName].tableName}: ${error.message}`);
      }
    }
  }
}
*/
