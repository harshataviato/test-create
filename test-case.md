# Automated Test Suite Setup and Execution

This guide provides instructions to set up the environment and run the automated tests for the Node PetClinic application.

## 1. Environment Setup

The testing environment relies on Node.js and a set of development dependencies including Mocha, Chai, and Supertest.

### Install Dependencies

Run the following command to install the main application dependencies and the testing libraries specified in `package.json`:


## 2. Database Configuration

The test suite is configured to use **SQLite** to ensure isolation and ease of setup. 

*   The tests utilize a helper (`tests/utils/dbHelper.js`) that automatically creates a test database instance.
*   The `sequelize.sync({ force: true })` command is executed before test suites to ensure a clean schema.
*   No external database installation (MySQL/Postgres) is required for these tests to pass, as they default to the Sequelize SQLite dialect.

## 3. Running the Tests

The `package.json` has been configured with a `test` script.

### Execute All Tests

To run the full suite of functional and unit tests:


**Expected Output:**
You should see output indicating that the database was synced and seeded, followed by the test results:


### Run Specific Test Files

To run a specific test file (e.g., Owner routes only):


## 4. Test Coverage Summary

The implemented tests cover the following functional areas:

*   **General**: 
    *   Home page rendering.
    *   Global Error handling (500).
    *   404 Page Not Found handling.
*   **Owners**:
    *   Create Owner (Success & Validation Failure).
    *   Find Owner (Search by last name, redirect single result, list multiple).
    *   View Owner Details.
    *   Update Owner.
*   **Pets**:
    *   Add Pet to Owner (Form rendering & Submission).
    *   Update Pet details.
    *   Validation checks on dates and required fields.
*   **Visits**:
    *   Add Visit to Pet.
    *   Validation of visit details.
*   **Veterinarians**:
    *   List Vets (HTML view).
    *   List Vets API (JSON response).
