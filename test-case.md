# Test Execution Instructions

The following commands will set up the environment and execute the automated test suite.

## 1. Install Dependencies
Install the required project dependencies and the test runner libraries (Mocha, Chai, Supertest).


## 2. Setup Database
The application uses SQLite by default. Sequelize will automatically create the database file (`petclinic.sqlite`) and sync the schema when the server starts. No manual SQL execution is required.

## 3. Run Tests
Execute the following command to run all test cases. This command configures the test environment, spins up the server, and executes all unit and integration tests found in the `test/` directory.


## 4. Expected Output
You should see output indicating that the server started on port 8081 (test port), followed by the results of the Mocha test suites.

Example:
