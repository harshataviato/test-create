module.exports = {
  // Use node environment for testing
  testEnvironment: 'node',
  // Glob patterns for test files
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  // Setup file to run before all tests
  setupFilesAfterEnv: ['./tests/setup.js'],
  // Collect coverage information
  collectCoverage: true,
  coverageDirectory: 'coverage',
  // Specify files to collect coverage from
  collectCoverageFrom: [
    'app.js',
    'config/**/*.js',
    'controllers/**/*.js',
    'models/**/*.js',
    'routes/**/*.js',
    '!config/database.js', // Exclude database CLI specific logic from coverage as it's not part of the app flow
  ],
  // Ignore coverage for files typically excluded from functional logic
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'views/' // EJS views are not JS code, so exclude from JS coverage
  ],
  // Don't report individual test results, just summary
  reporters: ["default"],
};
