# TypeScript PetClinic Sample Application

This is a TypeScript/Node.js re-implementation of the classic Spring PetClinic application. It uses Express.js for the web framework, EJS for templating, Zod for validation, and an in-memory data store for simplicity.

## Environment Setup

1.  **Node.js**: Ensure you have Node.js (v18 or higher recommended) and npm (or yarn) installed.
    *   Download Node.js: [https://nodejs.org/](https://nodejs.org/)

## Dependency Installation

Navigate to the project root directory (`ts-petclinic-main`) and install the required Node.js packages:


## Database Setup (In-memory)

This project uses an in-memory data store for simplicity. There is no external database setup required. The initial data is loaded from `src/repositories/inMemoryData.ts`.

## Running the Server

To start the application, compile the TypeScript code and then run the generated JavaScript:


Alternatively, you can run in development mode with `ts-node-dev` for automatic recompilation and server restarts:


Once the server is running, you can access the PetClinic application at `http://localhost:8080/`.

## Running Tests

(Note: For this conversion, explicit tests mimicking the Java tests were not generated, but here's how you would typically run them if implemented.)


## Available Scripts

*   `npm install`: Installs project dependencies.
*   `npm run build`: Compiles TypeScript files to JavaScript.
*   `npm start`: Starts the compiled Node.js server.
*   `npm run dev`: Starts the server in development mode with live reloading.
*   `npm run lint`: Runs ESLint for code quality checks.
*   `npm run format`: Formats code using Prettier.
