# Setup and Test Execution Guide

Follow these steps to set up the environment and execute the automated test suite.

## 1. Environment Setup
Ensure you have Node.js (v16+) installed on your system.

## 2. Dependency Installation
Install all required production and development dependencies:

## 3. Database Initialization
The application uses SQLite. No external database server is required. 
To initialize and seed the production/development database:

## 4. Run Automated Tests
The CI system and local developers can run the full suite using the following command. This command triggers Mocha to execute all files in the `tests/` directory.

## 5. Verify Functional Server
To manually verify the server is running after tests pass:
The server will be available at `http://localhost:8080`.
