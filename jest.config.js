/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  collectCoverageFrom: ['src/**/*.ts', '!src/app.ts', '!src/data-source.ts'],
  coverageDirectory: 'coverage',
  verbose: true,
  clearMocks: true
};
