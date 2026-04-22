# Aviato Flight Manager - Test Execution Guide

Follow these instructions to set up the environment and execute the automated test suite.

## 1. Environment Setup
Ensure you have Node.js (v14+) and npm installed on your system.

## 2. Dependency Installation
Install the project dependencies and the testing utilities:

## 3. Database Configuration
The application uses SQLite. For the production/dev environment, it defaults to `./database.sqlite`. For testing, it uses an in-memory database to ensure speed and isolation. No manual database creation is required as Sequelize handles migrations via `.sync()`.

## 4. Running the Tests
To execute all test suites (Model and Integration tests) with coverage verification:


## 5. Manual Verification (Optional)
To start the server manually and verify the UI:
Then navigate to `http://localhost:3000`.

## 6. Test Scenarios Covered
- **Model Validation**: Required fields, Unique constraints, Enum constraints.
- **Business Logic**: Prevent creation of flights where Origin equals Destination.
- **CRUD Operations**: Listing, Creating, and Deleting flights.
- **UI Rendering**: Ensuring EJS templates receive correct data and display error states.
- **Edge Cases**: Empty database handling, duplicate entry handling.
