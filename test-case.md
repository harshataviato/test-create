# Product Management Application - Test Cases

This document outlines the steps to set up the environment, install dependencies, and execute the automated test suite for the Product Management Node.js application.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

*   **Node.js**: Version 14 or higher (LTS recommended).
    *   You can download it from [nodejs.org](https://nodejs.org/).
*   **npm**: Node Package Manager, which comes bundled with Node.js.

## Installation Steps

1.  **Navigate to the project directory**:
    Assuming you are in the root directory of the project where `package.json` is located:

    ```bash
    cd /path/to/your/project/tmp7t56g96n

    This command will install `ejs`, `express` (for the application) and `mocha`, `chai`, `supertest`, `cheerio`, `cross-env` (for testing).

## Database Setup

This application uses an **in-memory database (`config/db.js`)**. This means:

*   No external database server (like MongoDB, PostgreSQL, MySQL) is required.
*   Data is not persistent across application restarts or test runs.
*   The test suite automatically clears the database before each test or test suite to ensure isolation.

Therefore, no special database setup commands are needed.

## Running the Application

To start the application server:


Once the server is running, you can access it in your web browser:
*   Product List: `http://localhost:3000/products`
*   Create Product: `http://localhost:3000/products/create`
*   Root Redirect: `http://localhost:3000/` will redirect to `/products`

## Running Test Cases

The automated test suite covers models, controllers, and routes, including success, edge, and failure scenarios.

To execute the test cases:


This command will:
1.  Set the `NODE_ENV` environment variable to `test` using `cross-env`.
2.  Run `mocha` recursively on all files ending with `.test.js` within the `./test` directory.
3.  Ensure Mocha exits after all tests are complete.

You will see output in your terminal indicating the number of passing and failing tests.
