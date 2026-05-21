# Test Case Execution Guide

This document outlines the steps to set up the environment, install dependencies, prepare the database, run the application, and execute the automated test suite for the project.

## 1. Environment Setup

Before proceeding, ensure you have Node.js and npm (Node Package Manager) installed on your system.

*   **Node.js**: It is recommended to use the latest LTS (Long Term Support) version. You can download it from [nodejs.org](https://nodejs.org/).
*   **npm**: npm is typically installed automatically with Node.js.

You can verify their installation by running:


## 2. Install Dependencies

Navigate to the project's root directory and install all required Node.js packages:


This command will install both `dependencies` (required for the application to run) and `devDependencies` (required for testing and development) as specified in `package.json`.

## 3. Database Setup

The application uses SQLite as its database. The schema needs to be initialized.

To initialize the development database:


This script will create the `tasks.db` file in the `db/` directory and set up the `tasks` table if they don't already exist.

## 4. Run the Application

To start the application in development mode (with `nodemon` for auto-reloading changes):


Or, to start the application in production mode:


The application will typically be accessible at `http://localhost:3000`.

## 5. Run Test Cases

The project includes a comprehensive suite of automated tests.

To execute all test cases:


This command will:
*   Set the `NODE_ENV` environment variable to `test`. This tells the application and database configuration to use a dedicated test database (`test_tasks.db`).
*   Run `mocha` with the `--recursive` flag to find and execute all test files ending with `.test.js` within the `test/` directory.
*   The `--exit` flag ensures that Mocha forces the process to exit after all tests complete, which is useful when dealing with open database connections.

Each test suite will manage its own dedicated test database (`test_tasks.db`), ensuring isolation. This includes creating the database, initializing the schema, seeding data (if necessary for the test), and deleting the database file after the tests complete.

The test results will be displayed in your terminal, indicating which tests passed, failed, or were pending.
