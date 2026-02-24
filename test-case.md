# Test Execution Instructions

To set up the environment and run the automated test suite, execute the following commands in the terminal within the project directory.

## 1. Install Dependencies
Install production and development dependencies (including Jest and Supertest):


## 2. Run Database Migrations (Optional)
The tests manage their own database synchronization automatically using `sequelize.sync({ force: true })` within the test lifecycle. However, to ensure the ORM is correctly configured:


## 3. Execute Test Suite
Run the full suite of automated tests. This command sets up the test environment, executes all unit and integration tests, and tears down connections automatically.


## Expected Output
You should see output indicating that all test suites passed:

