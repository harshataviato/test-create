# PetClinic Node.js

A Node.js implementation of the classic Spring PetClinic application. This project demonstrates a full-stack web application using Express, Sequelize (ORM), PostgreSQL, and EJS templates.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Running Tests](#running-tests)
- [Missing Functional Code and Test Strategy](#missing-functional-code-and-test-strategy)

## Features

*   **Owner Management**: Add, find, view, and update pet owners.
*   **Pet Management**: Add, edit, and view pets associated with owners.
*   **Visit Management**: Record and view visits for pets.
*   **Veterinarian Listing**: View a list of all veterinarians and their specialties.
*   **Internationalization (i18n)**: Support for multiple languages.
*   **Database**: PostgreSQL with Sequelize ORM for data persistence.
*   **Web Framework**: Express.js.
*   **Templating**: EJS.

## Project Structure


## Installation

1.  **Node.js and npm**: Ensure Node.js (LTS version recommended) and npm are installed on your system.
    ```bash
    node -v
    npm -v
    *Note: `ejs-mate` is a new dev dependency added to facilitate `layout.ejs` for cleaner view rendering.*

## Database Setup

This project uses PostgreSQL. You need to create two databases: one for development (`petclinic`) and one for testing (`petclinic_test`), along with a user.

1.  **Access PostgreSQL**:
    ```bash
    sudo -u postgres psql

3.  **Run Migrations**: Apply the database schema migrations for both development and test environments.
    ```bash
    # For development database
    NODE_ENV=development npm run migrate

    # For test database
    NODE_ENV=test npm run migrate

    *Note: The test database will be seeded automatically by the test runner (`npm test`).*

## Running the Application

To start the application in development mode:


Or for production:


The application will be accessible at `http://localhost:3000/` (or your configured `PORT`).

## Running Tests

The test suite uses `mocha`, `chai`, and `supertest`.

1.  **Ensure Test Database is Ready**: The `npm test` script will automatically handle dropping, migrating, and seeding the `petclinic_test` database before running tests.

2.  **Run Tests**:
    ```bash
    npm test
