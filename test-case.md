# Test Case Execution Guide

This document defines the instructions for setting up the environment and executing the automated test suite for the TypeScript MVC application.

## Prerequisites
- Node.js (v16 or higher)
- npm (Node Package Manager)

## Environment Setup & Dependency Installation

In the root directory of the project, install all required dependencies (including testing libraries `jest`, `ts-jest`, `supertest`):


*Note: Since the tests utilize an in-memory SQLite implementation configured dynamically in the integration tests, no external relational database service (e.g., MySQL or Postgres) needs to be booted. Migrations are automatically simulated during the `beforeAll` cycle of the integration tests using TypeORM's `synchronize: true` option.*

## Execution Commands

### 1. Run All Tests
Execute the complete suite encompassing Models, Controllers, Integration Routes, and Bootstrapping scripts:


### 2. Run Tests with Coverage Report
To verify that 100% test coverage has been met across functional logic:

*Expected Output: The console will output a table showing `% Stmts`, `% Branch`, `% Funcs`, and `% Lines` all at `100%`.*

### 3. Run the Development Server
If you wish to interactively test the UI using your browser post-testing:

Navigate to `http://localhost:3000` to interact with the application.
