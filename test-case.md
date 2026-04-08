# Product Management Application - Test Cases and Setup

This document outlines the steps to set up the product management application and run its automated test suite.

## 1. Environment Setup

Ensure you have the following installed on your system:
*   **Node.js**: Version 18.x or higher. You can download it from [nodejs.org](https://nodejs.org/).
*   **npm**: Node Package Manager, which comes bundled with Node.js.

## 2. Project Setup

1.  **Navigate to the project directory**:
    ```bash
    cd tmped_9m26a/
    (This directory can remain empty for basic functionality or hold CSS/JS files if added later).

## 3. Install Dependencies

Install all required production and development dependencies:


## 4. Database Setup

The application uses SQLite, which does not require a separate database server.
For development, it defaults to an `sqlite.db` file in the project root if `DATABASE_URL` is not set.
For testing, an in-memory SQLite database is used, which is managed automatically by the test runner.

### Running Migrations (for Development/Production Database)

To synchronize your database schema with the Sequelize models (create tables):


### Seeding the Database (for Development/Production Data)

To populate your database with initial product data:


**Note**: The `db:seed` command will only add seed data if the `Products` table is empty.

## 5. Running the Application

### Start in Development Mode (with Nodemon)

This will start the server using `nodemon`, which automatically restarts the application when file changes are detected.

### Start in Production Mode


Once the server is running, you can access the application in your web browser at `http://localhost:3000`.

## 6. Running Automated Tests

The project uses `Jest` for its automated tests.

To execute the entire test suite and generate a coverage report:


This command will:
*   Set the `NODE_ENV` environment variable to `test`.
*   Configure the database to use an in-memory SQLite instance, ensuring tests run quickly and in isolation without affecting your development database.
*   Run all test files located in the `tests/` directory.
*   Display a test summary and a code coverage report in your terminal.
*   A `coverage/` directory will be generated with a detailed HTML coverage report.
