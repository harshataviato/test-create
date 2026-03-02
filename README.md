# Node.js PetClinic

A pragmatic Node.js port of the famous Spring PetClinic sample application. Built with Express, Sequelize (SQLite/PostgreSQL/MySQL support), and EJS.

## Prerequisites

- Node.js (v18 or newer)
- NPM (v9 or newer)

## Environment Setup

Create a `.env` file in the root directory if you wish to use a persistent database. By default, the application uses an in-memory SQLite database for zero-config startup.


## Dependency Installation

Install all required packages:


## Database Setup and Migrations

This application uses Sequelize. The schema is automatically synchronized and seeded with initial data on the first start.

To manually reset and seed the database:

## Running the Server

Start the application in production mode:

For development with hot-reload:

The application will be available at [http://localhost:8080](http://localhost:8080).
