# Node.js PetClinic

A pragmatic Node.js port of the famous Spring PetClinic application.

## Prerequisites
- Node.js (v18 or higher recommended)
- NPM

## Environment Setup
1. Extract the files into a project directory.
2. Ensure you have the directory structure: `controllers/`, `models/`, `routes/`, `views/`, `public/`.

## Dependency Installation
Run the following command in the root directory:

## Database Setup and Migrations
This project uses **SQLite**. The database file (`petclinic.db`) will be created automatically in the root directory upon the first run. Sequelize is configured to sync models and seed initial data automatically.

## Running the Server
To start the production server:

The application will be accessible at: [http://localhost:8080](http://localhost:8080)

## Troubleshooting
If you need to reset the data, simply delete the `petclinic.db` file and restart the server.
