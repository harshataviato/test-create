# Test Environment Setup & Execution

Follow these steps to set up the environment and run the automated test suite.

## 1. Environment Preparation

Ensure Node.js (v18+) is installed.


## 2. Dependency Installation

Install the project dependencies and test development dependencies.


## 3. Database Migration & Seeding (Development Mode)

While tests use their own isolated database, you can verify the application runs manually by seeding the development database.


## 4. Run Application (Manual Verification)

Start the server to ensure the application boots correctly.


*Verify by visiting http://localhost:8080 in a browser.*
*Press Ctrl+C to stop the server.*

## 5. Execute Automated Test Suite

Run the full suite of integration tests. This command uses `cross-env` to set up a dedicated test database configuration, runs `jest`, and generates code coverage.


## 6. Expected Output

The test runner should output results for:
- `vets.test.js`
- `owners.test.js`
- `pets.test.js`
- `visits.test.js`
- `general.test.js`

Expect a summary indicating all tests passed and a coverage table showing 100% coverage for the functional areas.
