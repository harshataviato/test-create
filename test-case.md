# Automated Test Case Setup and Execution for Node.js PetClinic

This document provides instructions on how to set up the environment, install dependencies, prepare the database, and run the automated test suite for the Node.js PetClinic application.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

*   **Node.js**: Version 18.x or higher. You can download it from [nodejs.org](https://nodejs.org/).
*   **npm**: Node.js package manager, which comes with Node.js.
*   **PostgreSQL or MySQL**: A running instance of either database. The application is configured to use PostgreSQL by default, but can be switched to MySQL.
    *   For **PostgreSQL**: Ensure you have a PostgreSQL server running and have `psql` (PostgreSQL interactive terminal) available in your PATH.
    *   For **MySQL**: Ensure you have a MySQL server running and `mysql` client available in your PATH.

## 1. Environment Setup

1.  **Navigate to the project directory**:
    ```bash
    cd spring-petclinic-main

3.  **Configure Database in `.env`**:
    Edit the `.env` file to match your database credentials and settings.
    **Crucially, ensure you configure a separate database for `test` environment.**

    **Example for PostgreSQL (`.env`):**
    ```env
    # Application Configuration
    PORT=8080
    NODE_ENV=development

    # Database Configuration (PostgreSQL example)
    DB_DIALECT=postgres
    DB_HOST=localhost
    DB_PORT=5432
    DB_USER=petclinic_user # Use your database username
    DB_PASSWORD=petclinic_password # Use your database password
    DB_NAME=petclinic_dev  # Database for development

    # Test Database Configuration
    DB_NAME_TEST=petclinic_test # Dedicated database for tests

    # Static resource cache control (max-age in seconds)
    STATIC_CACHE_MAX_AGE=43200
npm install
CREATE DATABASE petclinic_dev;
CREATE DATABASE petclinic_test;
-- Grant necessary privileges if your DB_USER is not a superuser
GRANT ALL PRIVILEGES ON DATABASE petclinic_dev TO petclinic_user;
GRANT ALL PRIVILEGES ON DATABASE petclinic_test TO petclinic_user;
CREATE DATABASE petclinic_dev;
CREATE DATABASE petclinic_test;
-- Grant necessary privileges if your DB_USER is not a superuser
GRANT ALL PRIVILEGES ON petclinic_dev.* TO 'petclinic_user'@'localhost';
GRANT ALL PRIVILEGES ON petclinic_test.* TO 'petclinic_user'@'localhost';
FLUSH PRIVILEGES;

2.  **Seed Data**: This populates your `petclinic_dev` database with initial sample data.
    ```bash
    npm run db:seed
npm start
# Or for development with auto-restart:
npm run dev
npm test
