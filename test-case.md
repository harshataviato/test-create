# PetClinic Node.js Test Case Guide

This document provides instructions for setting up the environment and running the automated test cases for the PetClinic Node.js application.

## 1. Environment Setup

Ensure you have Node.js and PostgreSQL installed.

### Node.js and npm

Verify your Node.js and npm versions.
If not installed, download from [nodejs.org](https://nodejs.org/).

### PostgreSQL Database

Install PostgreSQL on your system.
- **Debian/Ubuntu**:
  ```bash
  sudo apt update
  sudo apt install postgresql postgresql-contrib
- **Windows**: Download the installer from the [PostgreSQL website](https://www.postgresql.org/download/windows/).

## 2. Database Creation and User Setup

You need to create a dedicated user and two databases (`petclinic` for development and `petclinic_test` for testing).

1.  **Access PostgreSQL command line (psql)**:
    ```bash
    sudo -u postgres psql
    This creates a user `petclinic` with password `petclinic` and two databases owned by this user.

## 3. Dependency Installation

Navigate to the project's root directory and install all required Node.js packages.


## 4. Database Migrations and Seeding

Apply the database schema and populate the development database with initial data. The test database (`petclinic_test`) will be automatically handled by the test runner.

1.  **Run Migrations for Development Database**:
    ```bash
    NODE_ENV=development npm run migrate

## 5. Running the Application (Optional, for manual verification)

To ensure the application starts correctly, you can run it in development mode.


You should see output similar to:
You can visit `http://localhost:3000/` in your web browser.

## 6. Running Automated Test Cases

The test suite is configured to automatically set up and tear down the `petclinic_test` database for each test run.

1.  **Execute Tests**:
    ```bash
    npm test
