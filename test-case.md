# Test Execution Guide

Follow these instructions to set up the environment and execute the automated test suite.

## 1. Environment Setup

Ensure you have **Node.js (v14+)** and **npm** installed on your system.

## 2. Dependency Installation

Install the required production and development dependencies (Mocha, Chai, Sinon, Supertest):


## 3. Database Setup

*Note: This specific application uses an in-memory mock logic for its model. In a production environment, ensure your `test_db` credentials are set in environment variables.*

For this suite, no external database installation is required as data logic is encapsulated in `models/helloModel.js`.

## 4. Running Migrations

(Not applicable for this HelloWorld implementation).

## 5. Running the Server

To verify the server starts correctly:

The server will be available at `http://localhost:3000`.

## 6. Executing Test Cases

### Execute Unit and Integration Tests
Run the following command to execute all tests in the `test/` directory:


### Verify Test Coverage
To generate a coverage report and ensure 100% functional logic coverage:


## 7. Test Scenarios Covered

| Category | Test Case | Description |
|----------|-----------|-------------|
| Model | `getGreeting` logic | Verifies the core string return value. |
| Controller | `renderHello` Success | Verifies data passing to EJS template. |
| Controller | `renderHello` Failure | Mocks a model exception to verify 500 error handling. |
| Controller | `getHelloJson` | Verifies JSON structure return. |
| Integration | `GET /` | End-to-end check for HTML rendering. |
| Integration | `GET /api/hello` | End-to-end check for REST endpoint. |
| Integration | 404 Route | Verifies handling of invalid URLs. |
