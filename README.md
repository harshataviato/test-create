# Harshataviato Test Create - Node.js MVC

This project is a pragmatic conversion of a Java Spring Boot MVC application into Node.js. It follows standard Google engineering practices: clear separation of concerns, no unnecessary abstractions, and idiomatic JavaScript.

## Features
- **MVC Architecture**: Models for data, EJS for views, Express for controllers.
- **In-Memory Store**: Fully functional CRUD without external database dependencies (perfect for testing/demo).
- **Responsive UI**: Clean, embedded CSS styling.

## Environment Setup

1. **Install Node.js**: Ensure you have Node.js (v14 or higher) installed.
2. **Initialize Directory**: Place all files in a folder named `harshataviato-test-create`.

## Dependency Installation

Navigate to the project root and run:

## Running the Server

To start the application, use:
The server will start on `http://localhost:3000`.

## Project Structure
- `app.js`: Application bootstrap and configuration.
- `models/`: Logic for data handling and business rules.
- `controllers/`: Logic for processing requests and returning responses.
- `routes/`: Definition of URL endpoints.
- `views/`: EJS templates for the user interface.

## Database Setup
Currently uses an **in-memory array** within `models/task.model.js`. To persist data to a database, you can replace the static methods in `TaskModel` with Sequelize (SQL) or Mongoose (NoSQL) calls. No migrations are required for the current implementation.
