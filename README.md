# Node.js PetClinic

A pragmatic Node.js conversion of the Spring PetClinic application using Express, EJS, and SQLite.

## Environment Setup

1.  **Install Node.js**: Ensure you have Node.js version 18 or higher installed.
2.  **Dependencies**: This project uses SQLite3, so no external database server is required.

## Installation

Install the required npm packages:


## Running the Application

To start the server:


For development with auto-reload:


The application will be available at: [http://localhost:8080](http://localhost:8080)

## Features Included
- **CRUD for Owners and Pets**: Full implementation of the logic found in `OwnerController` and `PetController`.
- **Search**: Find owners by last name with pagination.
- **Visits**: Add medical visits to specific pets.
- **Veterinarians**: View a list of vets and their specialties (HTML and JSON views).
- **Internationalization**: Support for multiple languages via query parameter (e.g., `?lang=de`).
- **Data Persistence**: Uses a local SQLite database file (`petclinic.sqlite`).

## Database Migrations
The application is configured to automatically sync the schema and seed initial data on startup if the database is empty.
