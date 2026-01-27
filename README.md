# PetClinic Node.js Sample Application

This is a Node.js implementation of the Spring PetClinic Sample Application, designed to demonstrate modern Node.js backend development practices using Express, Sequelize (ORM for PostgreSQL), and EJS templating.

## Understanding the Project Structure

The project follows a standard MVC (Model-View-Controller) pattern, with additional layers for routes, services, middleware, and validators.

*   `app.js`: Main entry point for the Express application, setting up middleware and routes.
*   `server.js`: Starts the Express server.
*   `config/`: Contains configuration files, such as database connection and i18n settings.
*   `controllers/`: Handles incoming HTTP requests, processes data, interacts with services, and renders views.
*   `models/`: Defines the data structures (entities) and their relationships using Sequelize.
*   `routes/`: Defines API endpoints and maps them to controller functions.
*   `services/`: Contains business logic and interacts with repositories (Sequelize models).
*   `validators/`: Houses validation logic using `express-validator`.
*   `middleware/`: Custom Express middleware for functionalities like model loading, flash messages, and locale setting.
*   `views/`: EJS templates for rendering HTML pages.
*   `public/`: Static assets (CSS, images, fonts).
*   `db/`: Database-related files, including Sequelize migrations, seeders, and raw SQL for reference.
*   `messages/`: JSON files for internationalization.

## Setup and Run

### Prerequisites

*   Node.js (v18 or later)
*   npm (usually comes with Node.js)
*   Docker (for running PostgreSQL locally via `docker-compose`)

### 1. Environment Setup

#### Install Dependencies

Navigate to the project root directory and install the Node.js dependencies:


### 2. Database Setup

We will use PostgreSQL as the database. You can run it locally using Docker Compose.

#### Start PostgreSQL with Docker Compose

Ensure Docker is running on your machine.

*Note: We are using the original `docker-compose.yml` for database setup for consistency.*

This will start a PostgreSQL container named `postgres` on port `5432`.
The database credentials are:
*   **Host**: `localhost`
*   **Port**: `5432`
*   **User**: `petclinic`
*   **Password**: `petclinic`
*   **Database Name**: `petclinic`

### 3. Database Migrations and Seeding

Once the PostgreSQL container is running, you need to set up the database schema and populate it with initial data.

#### Create Database (if not created by Docker Compose implicitly)

You might need to manually create the `petclinic` database if your Docker setup doesn't do it automatically. You can connect using a PostgreSQL client or `psql`:

Enter `petclinic` for the password when prompted.

#### Run Sequelize Migrations

To create the database schema:


#### Run Sequelize Seeders

To populate the database with initial data:


### 4. Running the Server

Start the Node.js Express server:


The application will be accessible at `http://localhost:3000`.

### Available Scripts

*   `npm start`: Starts the application in development mode.
*   `npm run migrate`: Runs pending Sequelize migrations to create/update database schema.
*   `npm run seed`: Runs Sequelize seeders to populate the database with initial data.
*   `npm run migrate:undo`: Undoes the last migration.
*   `npm run migrate:reset`: Undoes all migrations.
*   `npm test`: Runs tests (if implemented).

---
