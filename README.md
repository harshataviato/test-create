# Harsha Taviato Node.js App

A simple Node.js application demonstrating the MVC pattern with Express, Sequelize (SQLite), and Handlebars. This application provides basic CRUD operations for "Item" resources.

## Table of Contents

*   [Installation](#installation)
*   [Usage](#usage)
*   [Database Migrations and Seeding](#database-migrations-and-seeding)
*   [Running Tests](#running-tests)
*   [Project Structure](#project-structure)
*   [Technologies Used](#technologies-used)

## Installation

1.  **Clone the repository**:
    ```bash
    # Assuming your repository is available
    # git clone <repository-url>
    # cd harshataviato-test-create-ebb4653

3.  **Environment Variables**:
    Create a `.env` file in the root directory if you need to override default port or other settings. Example:
    *(Note: `dotenv` is configured to load these variables automatically.)*

## Usage

1.  **Start the application in development mode**:
    This will use `nodemon` to automatically restart the server on code changes.
    ```bash
    npm run dev

## Database Migrations and Seeding

This project uses Sequelize CLI for database management.

*   **Run migrations**: Applies pending database migrations to create tables.
    ```bash
    npx sequelize-cli db:migrate
*   **Undo all migrations**: Reverts all migrations, effectively dropping all tables.
    ```bash
    npx sequelize-cli db:migrate:undo:all

*(Note: For the `test` environment, tables are automatically dropped and recreated by the test suite itself, making manual migration/seeding for tests generally unnecessary.)*

## Running Tests

Automated tests are written using Mocha, Chai, and Supertest.

**Important Note on Testability (`app.js` modifications):**
To enable robust and isolated automated testing, the `app.js` file has been minimally modified from its original form. Specifically:
1.  The `app` Express instance and `db` Sequelize instance are now explicitly `module.exports`.
2.  The `app.listen()` call has been wrapped in an `if (process.env.NODE_ENV !== 'test')` condition. This ensures the HTTP server does not automatically start when `app.js` is imported by test files, preventing port conflicts and allowing the test runner (`supertest`) to manage the server lifecycle.
3.  The global error handler was updated to render an `error` view instead of `res.send()`.
4.  A temporary `GET /test-error` route was added to explicitly test the global error handler.

1.  **Run all tests**:
    ```bash
    npm test

## Project Structure


## Technologies Used

*   **Node.js**: JavaScript runtime environment
*   **Express.js**: Web application framework
*   **Sequelize**: ORM (Object-Relational Mapper) for Node.js
*   **SQLite3**: Lightweight, file-based database
*   **Express-Handlebars**: Handlebars view engine for Express
*   **Method-Override**: Middleware for HTTP method override
*   **Dotenv**: Loads environment variables from a `.env` file
*   **Mocha**: Test framework
*   **Chai**: Assertion library
*   **Supertest**: HTTP assertion library for testing Express apps
*   **Nodemon**: Utility for automatically restarting the node application when file changes are detected (development only)
