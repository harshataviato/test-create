# PetClinic Node.js Sample Application

This is a Node.js (TypeScript) port of the Spring PetClinic application, demonstrating a full-stack web application with Express.js, TypeORM, PostgreSQL, and Handlebars.

## Directory Structure


## Setup and Run

### Prerequisites

*   Node.js (LTS version, e.g., 18 or 20)
*   npm or yarn
*   Docker and Docker Compose (optional, for database setup)

### 1. Environment Setup

Copy the example environment file:


Edit the `.env` file and configure your database connection. By default, it's set up for PostgreSQL running via Docker Compose.


### 2. Dependency Installation

Navigate to the project root and install the Node.js dependencies:


### 3. Database Setup (using Docker Compose)

To run the PostgreSQL database using Docker Compose, execute:


This will start a PostgreSQL container named `petclinic-postgres-1` (or similar) on port `5432`.

### 4. Database Migrations and Seeding

Once the database is running, apply the schema and seed the initial data.
TypeORM handles schema synchronization and can run initial data scripts.


### 5. Running the Server

Start the Node.js application:


The application will be accessible at `http://localhost:8080/` (or the port specified in your `.env` file).

### Optional: Running in Development Mode

For development with live reloading (using `ts-node-dev`):


This command automatically recompiles and restarts the server on file changes.
