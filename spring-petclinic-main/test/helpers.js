/**
 * @file test/helpers.js
 * @description Centralized helper utilities for database setup and teardown in tests.
 * This ensures a clean and consistent database state for each test suite.
 */

const { sequelize, Sequelize } = require('../models');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Path to the sequelize-cli executable
const SEQUELIZE_CLI = path.resolve(__dirname, '../node_modules/.bin/sequelize');

/**
 * @function syncDb
 * @description Synchronizes all Sequelize models with the database, forcing a recreation of tables.
 * This effectively drops all tables and rebuilds them based on model definitions.
 * @returns {Promise<void>}
 */
async function syncDb() {
  console.log('--- SYNCING DATABASE ---');
  await sequelize.sync({ force: true });
  console.log('--- DATABASE SYNCED ---');
}

/**
 * @function runMigrations
 * @description Runs all pending Sequelize migrations.
 * @returns {Promise<void>}
 */
async function runMigrations() {
  console.log('--- RUNNING MIGRATIONS ---');
  try {
    const { stdout, stderr } = await execPromise(`${SEQUELIZE_CLI} db:migrate --env test`);
    console.log(stdout);
    if (stderr) console.error(stderr);
    console.log('--- MIGRATIONS COMPLETED ---');
  } catch (error) {
    console.error('Error running migrations:', error.stderr || error.message);
    throw error;
  }
}

/**
 * @function undoAllMigrations
 * @description Undoes all Sequelize migrations.
 * @returns {Promise<void>}
 */
async function undoAllMigrations() {
  console.log('--- UNDOING ALL MIGRATIONS ---');
  try {
    // Check current migrations
    const checkMigrations = await execPromise(`${SEQUELIZE_CLI} db:migrate:status --env test`);
    if (checkMigrations.stdout.includes('No migrations were executed')) {
      console.log('No migrations to undo.');
      return;
    }

    const { stdout, stderr } = await execPromise(`${SEQUELIZE_CLI} db:migrate:undo:all --env test`);
    console.log(stdout);
    if (stderr) console.error(stderr);
    console.log('--- ALL MIGRATIONS UNDONE ---');
  } catch (error) {
    // Handle specific errors like "No migrations to undo"
    if (error.stderr && error.stderr.includes('No migrations were executed')) {
      console.log('No migrations were found to undo. Continuing...');
    } else {
      console.error('Error undoing all migrations:', error.stderr || error.message);
      throw error;
    }
  }
}

/**
 * @function seedDb
 * @description Seeds the database with initial data using `sequelize db:seed:all`.
 * @returns {Promise<void>}
 */
async function seedDb() {
  console.log('--- SEEDING DATABASE ---');
  try {
    const { stdout, stderr } = await execPromise(`${SEQUELIZE_CLI} db:seed:all --env test`);
    console.log(stdout);
    if (stderr) console.error(stderr);
    console.log('--- DATABASE SEEDED ---');
  } catch (error) {
    console.error('Error seeding database:', error.stderr || error.message);
    throw error;
  }
}

/**
 * @function resetAndSeedDatabase
 * @description Resets (drops and recreates tables) and seeds the database.
 * This is typically run before each test file or suite for isolation.
 * Uses `sequelize.sync({ force: true })` for simplicity over `undo/run migrations`.
 * NOTE: For a real CI/CD pipeline, `undoAllMigrations` + `runMigrations` is safer,
 * but `sync({ force: true })` is faster and sufficient for testing dynamic model changes.
 *
 * Update: Reverting to using `undoAllMigrations` + `runMigrations` + `seedDb` to fully simulate the cli workflow.
 */
async function resetAndSeedDatabase() {
  // Ensure the database connection is established
  if (!sequelize.isDefined('Vet')) { // Check if any model is defined to ensure connection
    await sequelize.authenticate();
  }
  await undoAllMigrations();
  await runMigrations();
  await seedDb();
  console.log('--- DATABASE RESET AND SEED COMPLETE ---');
}

/**
 * @function closeDb
 * @description Closes the Sequelize database connection.
 * @returns {Promise<void>}
 */
async function closeDb() {
  console.log('--- CLOSING DATABASE CONNECTION ---');
  await sequelize.close();
  console.log('--- DATABASE CONNECTION CLOSED ---');
}

module.exports = {
  sequelize,
  Sequelize,
  syncDb,
  runMigrations,
  undoAllMigrations,
  seedDb,
  resetAndSeedDatabase,
  closeDb
};

