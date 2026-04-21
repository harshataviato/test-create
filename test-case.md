# Test Execution Guide

Follow these steps to set up the environment and execute the automated test suite.

## 1. Environment Setup
Ensure Node.js is installed on your system.

## 2. Dependency Installation
Install the application dependencies and testing frameworks (Mocha, Chai, Supertest):

## 3. Database Setup & Migrations
This application uses an in-memory data store for the `test_db` equivalent. No external database installation is required. Data is seeded automatically in `models/task.model.js`.

## 4. Running the Server
To run the server manually:

## 5. Running Automated Tests
Execute the full test suite to verify 100% functional coverage:

### Coverage Areas:
- **Model Tests**: Verifies CRUD logic, ID auto-incrementing, and status toggling.
- **Route Tests**: Verifies HTTP GET/POST endpoints, redirects, and EJS rendering.
- **Controller Tests**: Verifies logic for handling empty inputs and ID parsing.
- **Edge Cases**: Verifies behavior with invalid IDs, empty strings, and non-existent resources.
