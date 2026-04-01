/**
 * @file Global test setup and teardown for Mocha.
 * This file handles database connection and disconnection for the entire test suite.
 */

// Load environment variables for testing.
// Ensure .env is loaded first, then specifically handle test environment.
require('dotenv').config();
process.env.NODE_ENV = 'test'; // Ensure NODE_ENV is set to test

const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const Product = require('../models/product'); // Import Product model to clear its collection

// Global before hook for all tests
before(async function() {
  this.timeout(10000); // Set a higher timeout for initial DB connection

  // Connect to the test database
  await connectDB();
});

// Global after hook for all tests
after(async function() {
  // Disconnect from the database after all tests are done
  await disconnectDB();
});

// Before each test suite (describe block), clear the Product collection
beforeEach(async function() {
  await Product.deleteMany({});
});
