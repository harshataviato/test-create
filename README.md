# Aviato Startup Manager (Node.js Implementation)

A pragmatic, fully functional CRUD application built with Node.js, Express, and Sequelize. This project replicates a typical Startup Management system (MVC architecture) converted from a Java Spring Boot style to a modern JavaScript backend.

## Prerequisites

- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)

## Environment Setup

1. Create a project directory and navigate into it.
2. Copy all the provided files into the directory according to the file structure.

## Dependency Installation

Run the following command to install Express, Sequelize, EJS, and SQLite3:


## Database Setup & Migrations

This project uses **SQLite** for a zero-config setup. 
- No manual database creation is required. 
- The `sequelize.sync()` method in `app.js` will automatically create the `database.sqlite` file and the `Startups` table upon the first launch.

## Running the Server

To start the application:


Once started, the server will be available at:
**http://localhost:3000**

## Project Features
- **MVC Pattern**: Clear separation of concerns between Models, Views, and Controllers.
- **Persistence**: Data is saved to a local SQLite database.
- **RESTful Design**: Uses standard HTTP verbs for CRUD operations.
- **Google Standards**: Concise documentation, modular code, and error handling.
