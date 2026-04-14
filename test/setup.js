// test/setup.js
const path = require('path');
const { execSync } = require('child_process');
const chai = require('chai');
const chaiSubset = require('chai-subset');

// Set the NODE_ENV to 'test' to ensure test-specific configurations are loaded
process.env.NODE_ENV = 'test';
// Load environment variables for tests from .env.test
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.test') });

// Use different port for test server
process.env.PORT = process.env.PORT || 8081;

// Import the Express app and Sequelize instance from the main application
const app = require('../src/app');
const sequelize = require('../src/config/database'); // This points to the main app's sequelize, but will use test env vars

// Configure Chai
chai.use(chaiSubset);
global.expect = chai.expect;

// Store the server instance
let server;

// Global Mocha setup hook: runs once before all tests
before(async function() {
  this.timeout(30000); // Increase timeout for initial database setup operations

  console.log('\n--- Test Setup: Initializing database and starting server ---');
  try {
    const sequelizeCliConfigPath = path.join(__dirname, '../src/config/sequelizeConfig.js');
    const testDbUrl = process.env.DATABASE_URL_TEST;

    if (!testDbUrl) {
      throw new Error("DATABASE_URL_TEST environment variable is not set. Please create a .env.test file.");
    }

    const dbName = testDbUrl.split('/').pop();
    const dbUser = testDbUrl.split('//')[1].split(':')[0]; // e.g., petclinic from postgres://petclinic:petclinic@...

    console.log(`Using test database: ${dbName} for user: ${dbUser}`);

    // Drop and re-create the test database
    console.log(`Dropping existing database '${dbName}'...`);
    // Use the `postgres` database to issue commands against other databases
    execSync(`PGPASSWORD=petclinic dropdb --if-exists "${dbName}" -U "${dbUser}" || true`, { stdio: 'inherit' });
    console.log(`Creating fresh database '${dbName}'...`);
    execSync(`PGPASSWORD=petclinic createdb "${dbName}" -U "${dbUser}" || true`, { stdio: 'inherit' });
    console.log(`Database '${dbName}' ensured clean.`);

    // Run migrations for the test environment
    console.log('Running database migrations for test environment...');
    execSync(`npx sequelize db:migrate --env test --config "${sequelizeCliConfigPath}"`, { stdio: 'inherit' });
    console.log('Database migrations completed.');

    // Run seeders for the test environment
    console.log('Running database seeders for test environment...');
    execSync(`npx sequelize db:seed:all --env test --config "${sequelizeCliConfigPath}"`, { stdio: 'inherit' });
    console.log('Database seeders completed.');

    // Authenticate Sequelize connection (from src/config/database.js)
    await sequelize.authenticate();
    console.log('Sequelize successfully connected to the test database.');

    // Start the Express app for integration tests
    server = app.listen(process.env.PORT, () => {
      console.log(`Test server started on http://localhost:${process.env.PORT}`);
    });

  } catch (error) {
    console.error('ERROR: Test setup failed!', error);
    if (error.stdout) console.error('Stdout:', error.stdout.toString());
    if (error.stderr) console.error('Stderr:', error.stderr.toString());
    process.exit(1); // Exit process if setup fails
  }
  console.log('--- Test Setup Completed ---');
});

// Global Mocha teardown hook: runs once after all tests
after(async function() {
  this.timeout(10000); // Increase timeout for teardown operations

  console.log('\n--- Test Teardown: Closing server and database connection ---');
  try {
    // Close the Express server
    if (server) {
      await new Promise(resolve => server.close(resolve));
      console.log('Test server closed.');
    }

    // Close Sequelize connection
    if (sequelize) {
      await sequelize.close();
      console.log('Sequelize connection closed.');
    }

    console.log('--- Test Teardown Completed ---');
  } catch (error) {
    console.error('ERROR: Test teardown failed!', error);
    // Don't exit process if teardown fails, just log it.
    // The main process will exit anyway.
  }
});
