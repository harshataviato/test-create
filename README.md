# PetClinic Node.js

This is a Node.js implementation of the Spring PetClinic application, demonstrating how to build a web application with Express.js, EJS for templating, and PostgreSQL as the database.

## Directory Structure


## Installation and Setup

### Prerequisites

*   Node.js (v20 or higher)
*   npm (v9 or higher)
*   PostgreSQL (v16 or higher)
*   Docker (optional, for Dockerized development/deployment)

### 1. Clone the repository

**(Note: This step is typically `git clone <repository-url>`, but per instructions, it's omitted.)**
Ensure you are in the project's root directory.

### 2. Install Dependencies

Navigate to the project directory and install Node.js dependencies:


### 3. Database Setup (Local PostgreSQL)

You'll need a PostgreSQL database named `petclinic` (for development) and `petclinic_test` (for tests).

#### Create Databases

You can create these databases and a user with `psql` or a database management tool:


#### Initialize Database Schema and Data

Run the following commands to create the schema and populate initial data for the `petclinic` database:


This script executes `db/postgres/schema.sql` and `db/postgres/data.sql` against the `petclinic` database on `localhost` using the `petclinic` user.

### 4. Running the Application

#### Development Mode (with Nodemon)


This will start the Express.js server using `nodemon`, which provides live reloading on code changes. The application will be accessible at `http://localhost:8080`.

#### Production Mode


This will start the Express.js server using `node`. The application will be accessible at `http://localhost:8080`.

### 5. Running with Docker (Optional)

If you prefer to run the application and database using Docker Compose:


This will build the Node.js application image and start both the `app` and `postgres` services. The application will be accessible at `http://localhost:8080`.

**Note:** When running with Docker Compose, the `db:init:postgres` script will automatically be handled as part of the `app` service startup if the database is new. If you need to re-initialize an existing Docker volume, you might need to stop, remove the volume (`docker volume rm petclinic-node_pg_data`), and then `docker-compose up --build` again.

## Running Tests

Automated tests cover models, repositories, middleware, controllers, and routes. A dedicated test database `petclinic_test` is used for isolation.


This command will:
1.  Set up the `petclinic_test` database (create schema, seed initial data, then clear for each test run).
2.  Run all Jest test files.

## Project Technologies

*   **Backend**: Node.js, Express.js
*   **Database**: PostgreSQL
*   **Templating**: EJS
*   **Styling**: Bootstrap 5, Font Awesome
*   **Dependencies**: `pg`, `express-validator`, `i18n`, `connect-flash`, `express-session`, `moment`, `node-cache`
*   **Development Tools**: `nodemon`
*   **Testing**: `jest`, `supertest`

## Author

Google Senior Engineer
