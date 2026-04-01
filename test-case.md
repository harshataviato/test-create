# Test Case Document for Product Management Application

This document outlines the steps to set up the environment, install dependencies, configure the database, run the application, and execute the automated test suite.

## Environment Setup

1.  **Node.js and npm:**
    *   Ensure you have Node.js (v14 or higher recommended) and npm (Node Package Manager) installed. You can download them from [nodejs.org](https://nodejs.org/).
    *   Verify installation by running:
        ```bash
        node -v
        npm -v

## Dependency Installation

1.  Navigate to the root directory of the project in your terminal.
2.  Install all project dependencies (including development dependencies for testing) using npm:
    ```bash
    npm install
    **Note:** Ensure your MongoDB instance is running and accessible at `localhost:27017` or the specified address.

## Running the Application

To start the development server:

(This uses `nodemon` for auto-reloading on file changes)

Alternatively, to start the application in production mode:


The application should be accessible in your web browser at `http://localhost:3000`.

## Running Test Cases

The automated test suite uses `mocha`, `chai`, `supertest`, and `sinon` to verify the application's functionality.

1.  **Ensure MongoDB is running** as the tests connect to `product_test_db`.
2.  **Ensure you have configured `MONGO_URI_TEST` in your `.env` file.**
3.  Execute the test suite from the project root directory:
    ```bash
    npm test

