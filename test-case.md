# PetClinic Node.js Automated Test Cases

This document outlines the steps to set up the environment, install dependencies, configure the database, and run the automated test suite for the PetClinic Node.js application.

## 1. Environment Setup

Ensure you have the following installed on your system:

*   **Node.js**: Version 18.x or higher.
*   **npm**: Comes with Node.js.
*   **PostgreSQL**: Version 10 or higher.
*   **Git**: For version control (if you're cloning the repository).

## 2. Dependency Installation

Navigate to the project's root directory and install the Node.js dependencies:


## 3. Database Setup (PostgreSQL)

The application uses two PostgreSQL databases: one for development (`petclinic`) and one for testing (`petclinic_test`).

### 3.1. Create PostgreSQL Databases

You need to create two databases. The `petclinic` user with `petclinic` password is assumed. If your PostgreSQL setup differs, please update the `DATABASE_URL` and `DATABASE_URL_TEST` in `.env.example` and `.env.test` respectively.


### 3.2. Configure Environment Variables

Create a `.env` file in the project root directory, based on `.env.example`, and fill in your database connection string and session secret.


Edit `.env` (e.g., `nano .env`):

Also, create a `.env.test` file for the test environment. This file is crucial for the automated tests.


Edit `.env.test` (e.g., `nano .env.test`):

### 3.3. Run Migrations and Seeders (Development)

For the development database, you can run migrations and seed initial data:


Or, to reset and re-seed:


## 4. Running the Application Server (Development)

To start the application in development mode:


The application will be accessible at `http://localhost:8080` (or the port specified in your `.env` file).

## 5. Running Automated Test Cases

The test suite uses Mocha, Chai, and Supertest. The `npm test` command is configured to:
*   Set `NODE_ENV=test`.
*   Load environment variables from `.env.test`.
*   Connect to the `petclinic_test` database.
*   Automatically drop, create, migrate, and seed the `petclinic_test` database before running tests.
*   Start and stop the Express app on a dedicated port (8081) for integration tests.

To run the tests, simply execute:


This command will execute all test files located in the `test/` directory.

**Note on initial test run:** The first time you run `npm test`, it might take a bit longer as it sets up the test database from scratch. Subsequent runs should be faster.
