# PetClinic TypeScript Sample Application

This is a TypeScript-based re-implementation of the Spring PetClinic sample application, leveraging Node.js with Express.js for the web framework, TypeORM for database interaction, and EJS for templating.

## Project Structure

The project is structured to separate concerns into models (entities), repositories, services (business logic), and controllers (API/route handlers), following a common MVC-like pattern for Node.js applications.


## Setup and Running the Project

This guide will walk you through setting up the TypeScript PetClinic application locally.

### Prerequisites

*   Node.js (LTS version, e.g., 18.x or 20.x)
*   npm or yarn (npm is used in commands below)
*   Docker and Docker Compose (for database setup)

### 1. Environment Setup

It's recommended to use a `.env` file to manage your environment variables, especially for database connection strings. Copy the provided example:


Edit the `.env` file to configure your database. The `docker-compose.yml` file is pre-configured for PostgreSQL.


### 2. Dependency Installation

Navigate to the project root directory and install the Node.js dependencies:


### 3. Database Setup (using Docker Compose)

The easiest way to get a PostgreSQL database up and running is with Docker Compose.


This command will start a PostgreSQL container named `petclinic-db` (or similar depending on your docker-compose config) and expose it on port `5432` as configured in `docker-compose.yml`.

### 4. Database Migrations and Seeding

Once the database container is running, you need to run the TypeORM migrations to create the schema and seed the initial data.

**Create the database (if not already created by Docker Compose, though it usually is):**

Connect to your PostgreSQL instance (e.g., using `psql` or `pgAdmin`) and ensure the `petclinic` database exists. The `docker-compose.yml` typically creates it.

**Run TypeORM Migrations:**

TypeORM migrations are used to apply schema changes. In this project, the initial migrations also set up the tables.


**Seed Initial Data:**

After migrations, you need to populate the database with initial data, similar to `data.sql` in the Java version.


### 5. Running the Application

After installing dependencies and setting up the database, you can start the application:

**Development Mode (with live reload):**


This uses `ts-node-dev` for automatic recompilation and server restart on code changes.

**Production Mode (build and start):**

First, compile the TypeScript code:


Then, start the compiled JavaScript application:


### Accessing the Application

Once the server is running, you can access the PetClinic application in your web browser at:

[http://localhost:8080](http://localhost:8080)

## Docker Compose for Development

The `docker-compose.yml` can be extended to include the Node.js application itself:


You would also need a `Dockerfile` in the project root for the Node.js application:


To run both the database and the application with Docker Compose:

