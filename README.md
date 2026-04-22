# Aviato Flight Management System (Node.js Port)

This project is a pragmatic Node.js implementation of a Flight Management System, migrated from a Java Spring Boot architecture to an Express/Sequelize MVC pattern.

## Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

## Environment Setup
The application uses a `.env` file for configuration. The default configuration uses a local SQLite database for zero-config setup.

1. Create a `.env` file in the root directory (optional, defaults are set in `app.js`).

## Dependency Installation
Install the necessary Node.js packages:

## Database Setup & Migrations
This project uses **Sequelize ORM**. On the first run, the system will automatically create the `database.sqlite` file and the necessary tables. No manual SQL scripts are required.

## Running the Server
To start the application in production mode:

To start the application in development mode (with auto-reload):

The application will be accessible at: `http://localhost:3000`

## Project Features
- **MVC Architecture**: Clear separation of Models (Sequelize), Views (EJS), and Controllers (Express logic).
- **CRUD Operations**: Create, Read, and Delete flights.
- **Auto-Sync**: Database schema is automatically synchronized with the Javascript models.
- **Validation**: Business logic prevents creating flights with identical origin and destination.
