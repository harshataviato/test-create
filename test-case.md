# Test Case Document

This document outlines the steps to set up the environment, install dependencies, and run automated tests for the "Hello World" Node.js application.

## 1. Environment Setup

Ensure you have Node.js and npm (Node Package Manager) installed on your system.
You can download them from the official Node.js website: [nodejs.org](https://nodejs.org/)

To verify your Node.js and npm installation, run the following commands in your terminal:


## 2. Dependency Installation

Navigate to the root directory of the project where the `package.json` file is located.

Install the project's runtime dependencies and development dependencies (including Jest and Supertest for testing):


## 3. Database Setup (Not Applicable for this Project)

This specific "Hello World" application does not utilize a database. The `MessageModel` returns a hardcoded string and does not connect to any external data source. Therefore, no database setup, migration, or seeding steps are required for this project.

## 4. Running Automated Tests

To execute the full suite of automated tests, run the following command from the project root directory:


This command will:
*   Run unit tests for `models/messageModel.js`.
*   Run unit tests for `controllers/helloController.js`.
*   Run integration tests for `app.js` (routes).
*   Report test results, including success/failure and coverage (if configured).

The `npm test` script uses `jest --detectOpenHandles --forceExit` to ensure all test processes terminate cleanly, especially important when testing Express applications that start a server.

## 5. Running the Application Server

To start the "Hello World" web server, execute the following command:


Once the server is running, you can access the application in your web browser by navigating to `http://localhost:3000`.
