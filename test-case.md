# Test Case Execution Guide

This guide details the steps to set up the environment and execute the automated test suite for the Node.js PetClinic application.

## 1. Environment Setup

Ensure Node.js is installed. Initialize the project dependencies.


## 2. Database Setup

The test suite is configured to use **SQLite** in **Memory Mode**. No external database installation (MySQL/PostgreSQL) is required for running these tests. The Sequelize ORM handles table creation (`sync`) automatically within the test lifecycle hooks (`beforeAll`).

## 3. Running the Test Suite

Execute the following command to run all test cases. This utilizes Jest as the test runner.


**Expected Output:**
Jest will scan the `tests/` directory and execute the following suites:
1. `tests/unit/models.test.js`
2. `tests/integration/general.test.js`
3. `tests/integration/owners.test.js`
4. `tests/integration/pets.test.js`
5. `tests/integration/vets.test.js`

You should see a summary of passed tests and 100% coverage of the functional paths provided.

## 4. Manual Server Verification (Optional)

If you wish to run the application manually to verify behavior in the browser:

Access the application at: `http://localhost:8080`
