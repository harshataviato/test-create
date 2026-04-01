// This file runs once before all test suites.
require('dotenv').config(); // Load environment variables from .env file

// Set a dedicated test database name
process.env.DB_NAME = process.env.DB_NAME_TEST || 'petclinic_test';
process.env.NODE_ENV = 'test'; // Ensure NODE_ENV is set to test

const { getSequelize, authenticate, sync, seedData } = require('../config/database');
const sequelize = getSequelize();

beforeAll(async () => {
  console.log(`Setting up test database: ${process.env.DB_NAME}`);
  try {
    await authenticate();
    console.log('Test database connection established.');

    // Force sync (drop and recreate tables) for a clean slate
    await sync({ force: true });
    console.log('Test database schema synchronized (recreated).');

    // Seed initial data
    await seedData();
    console.log('Test database seeded with initial data.');

  } catch (error) {
    console.error('Error during test database setup:', error);
    process.exit(1); // Exit if DB setup fails
  }
});

afterAll(async () => {
  console.log('Tearing down test database.');
  try {
    await sequelize.close();
    console.log('Test database connection closed.');
  } catch (error) {
    console.error('Error during test database teardown:', error);
  }
});

// Helper to clear and re-seed database for each suite or test if needed
// Individual suites can choose to call this in beforeEach for maximum isolation.
global.reseedTestDatabase = async () => {
  await sync({ force: true });
  await seedData();
};
