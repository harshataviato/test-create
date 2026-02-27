# Node.js PetClinic

This is a pragmatic conversion of the Spring PetClinic sample application to Node.js.

## Environment Setup
- Ensure [Node.js](https://nodejs.org/) (v18 or higher) is installed on your machine.

## Dependency Installation
Run the following command to install required packages:

## Database Setup and Migrations
The application uses SQLite as an in-memory/file-based database (mirroring the H2 experience). The schema is automatically synchronized when the server starts.

To populate the database with initial data (vets, pet types, and sample owners):

## Running the Server
To start the application:
The application will be available at [http://localhost:8080](http://localhost:8080).

## For Development
To run with auto-reload on file changes:
