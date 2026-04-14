# Product Management App - Automated Test Case Execution Guide

This document outlines the steps to set up the environment, install dependencies, and run the automated test suite for the Product Management App.

## 1. Environment Setup

Ensure you have Node.js and npm (Node Package Manager) installed on your system.

*   **Node.js**: It is recommended to use an LTS (Long Term Support) version of Node.js.
    You can download it from the official Node.js website: [nodejs.org](https://nodejs.org/)

To verify Node.js and npm are installed, open your terminal or command prompt and run:


You should see version numbers printed for both.

## 2. Dependency Installation

Navigate to the root directory of the project (`tmpb3c648bm/`) in your terminal.
Install all project dependencies (including development dependencies for testing) using npm:


This command will install `express`, `ejs`, `ejs-mate` for the application, and `mocha`, `chai`, `supertest`, `sinon` for testing.

## 3. Database Setup

This application uses an **in-memory database** (`config/db.js`), which is a simple JavaScript array. No external database server (like PostgreSQL, MySQL, or MongoDB) needs to be set up or configured. The database state is reset automatically for each test suite to ensure isolation.

## 4. Migrations

This application does not use database migrations as it employs an in-memory data store. Therefore, no migration commands are required.

## 5. Running the Application Server (Optional)

If you wish to run the application in development or production mode, you can use the following commands from the project root directory:

*   **Development Mode (with nodemon for auto-restarts):**
    ```bash
    npm run dev

Once the server is running, you can access the application in your web browser, typically at `http://localhost:3000/products`.

## 6. Running Test Cases

To execute the full suite of automated tests, navigate to the project's root directory (`tmpb3c648bm/`) in your terminal and run the following command:


This command will:
*   Use `mocha` to discover and run all test files located in the `test/` directory.
*   The tests are structured to cover unit tests for models, services, and controllers, as well as integration tests for routes and overall application behavior.
*   The `--recursive` flag ensures that tests in subdirectories of `test/` are found.
*   The `--exit` flag forces Mocha to exit after tests complete, which is useful when testing applications that keep the event loop alive (like Express servers).

Upon completion, Mocha will provide a summary of passed and failed tests.
