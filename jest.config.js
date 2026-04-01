module.exports = {
  testEnvironment: 'node',
  rootDir: './',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/app.js', // Exclude app.js itself from coverage as it's the entry point
    '!src/routes/index.js', // Main router, mostly calls other routers, hard to cover thoroughly without full app
    '!src/public/**', // Exclude static assets
    '!src/db/postgres/**', // Exclude raw SQL files
    '!src/config/i18n.js' // i18n setup, mostly configuration data
  ],
  setupFilesAfterEnv: ['<rootDir>/src/tests/jest.setup.js'],
  cacheDirectory: '<rootDir>/.jest_cache',
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
  },
  verbose: true,
  clearMocks: true,
  moduleFileExtensions: ['js', 'json', 'node'],
  testMatch: [
    '**/src/tests/**/*.test.js',
    '**/src/**/*.test.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
  ],
  coverageReporters: [
    'json-summary',
    'text',
    'lcov'
  ]
};
