# Hello World TypeScript BFF

This project is a simple "Hello World" application demonstrating the architecture and patterns used in the Mobile BFF project, built with NestJS and following the SIMPLE framework conventions.

## Environment Setup

1.  **Node.js**: Ensure you have Node.js (LTS version, e.g., 18.x or 20.x) and npm (or yarn) installed.
    You can download Node.js from [nodejs.org](https://nodejs.org/).

2.  **TypeScript**: TypeScript is a superset of JavaScript that compiles to plain JavaScript. It's usually installed globally or as a project dependency.

## Dependency Installation

Navigate to the project directory and install the required dependencies using yarn:


## Running the Server

To start the development server:


The application will typically run on `http://localhost:3000`. You can access the "Hello World" endpoint at `http://localhost:3000/hello`.

To access the "Hello World" endpoint for the NRMA brand, use the `X-Iag-Brand` header:


To render the HTML view:


## Running Tests

To execute all tests:


To run a specific test file, for example, the "Hello World" feature tests:


## Linting

To lint the project:


## Formatting

To format the code with Prettier:

