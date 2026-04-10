# Harsha Taviato Node.js App - Test Cases

This document outlines the steps to set up the environment and run the automated test suite for the Harsha Taviato Node.js application.

## 1. Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js**: Version 14 or higher (LTS recommended).
    *   You can download it from [nodejs.org](https://nodejs.org/).
    *   Verify installation: `node -v` and `npm -v`

## 2. Environment Setup

1.  **Navigate to the project directory**:
    Assuming your project is in `tmp17t2ajrq/`:
    ```bash
    cd tmp17t2ajrq/

3.  **Database Setup (for testing)**:
    The tests use a dedicated SQLite database file (`db/test.sqlite`). The test runner automatically manages the database schema (drops and recreates tables) for each test suite, ensuring a clean slate. No manual migration steps are typically required before running tests, but for completeness, if you were to run migrations manually for a non-test environment:
    ```bash
    # For development database (not strictly needed for tests)
    npx sequelize-cli db:migrate
    This command sets `NODE_ENV=test`, runs `mocha`, exits after completion, and has a timeout of 5 seconds per test.

2.  **Run Tests in Watch Mode (for development)**:
    This command is useful during development as it automatically re-runs tests when source files or test files change.
    ```bash
    npm run test:watch
2.  **Update `package.json` scripts**:
    Add a coverage script in `package.json`:
    ```json
    "scripts": {
      "start": "node app.js",
      "dev": "nodemon app.js",
      "test": "NODE_ENV=test mocha --timeout 5000 --exit",
      "test:watch": "NODE_ENV=test mocha --timeout 5000 --watch --exit",
      "coverage": "NODE_ENV=test nyc --reporter=lcov --reporter=text npm test"
    },

This will generate a coverage report in your console and an `lcov` report in a `coverage/` directory, which can be used by CI tools or local IDE extensions.
