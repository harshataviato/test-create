# Test Setup and Execution Guide

Follow these steps to set up the environment and run the automated test suite for the PetClinic application.

## 1. Environment Setup
Ensure Node.js is installed on your system.

## 2. Dependency Installation
Install all required production and development dependencies:

## 3. Database Initialization
The application uses SQLite. The database schema and seed data are automatically initialized when the application or tests start. To ensure a clean state for tests, the test suite uses a dedicated `test.db`.

## 4. Running the Server (Optional)
If you wish to interact with the UI manually:

## 5. Running Automated Tests
Execute the comprehensive test suite (Models, Controllers, and Routes):

## 6. Verify Coverage
To verify that functional logic is 100% covered:
