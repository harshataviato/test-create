# Environment Setup and Test Execution

Follow these steps to set up the environment and run the test suite.

## 1. Environment Setup
Ensure Node.js is installed on your system. No external database is required as the project uses SQLite.

## 2. Dependency Installation
Install all required production and testing dependencies:

## 3. Database Setup and Migrations
The application is configured to automatically sync the schema and seed data on startup. For testing purposes, the test suites handle database synchronization internally using `sequelize.sync({ force: true })`.

## 4. Running the Application
To start the server manually:
The application will be available at `http://localhost:8080`.

## 5. Running Test Cases
Execute the full suite of automated tests:
