# Test Execution Guide

Follow these steps to set up the environment and execute the automated test suite for the Aviato Startup Manager.

## 1. Environment Setup
Ensure Node.js is installed in your environment.

## 2. Dependency Installation
Install both production and development dependencies required for the test suite:

## 3. Database Initialization
The application uses SQLite. The test suite automatically handles migrations and data isolation using `sequelize.sync({ force: true })` before running tests. No manual database creation is required.

## 4. Running Tests
Execute the full test suite using the following command:

### Expected Output
Successful execution will return:
- `Startup Model Unit Tests`: Validates schema integrity.
- `Startup Routes Integration Tests`: Validates HTTP endpoints and UI rendering logic.

## 5. Running the Application (Manual Verification)
If you wish to manually verify the application:
1. Start the server:
   ```bash
   npm start
