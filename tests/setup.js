/**
 * Global Test Setup
 * 
 * Configures the test environment variables and ensures the database
 * is clean before test suites run.
 */

// Force SQLite for testing
process.env.DATABASE = 'sqlite';
// Use a distinct file for testing or memory
process.env.SQLITE_STORAGE = ':memory:'; 

// Suppress console logs during tests to keep output clean
global.console = {
  ...console,
  log: jest.fn(),
  // error: jest.fn(), // Keep errors visible for debugging
};
