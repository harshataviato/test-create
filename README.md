# Hello World MVC - Node.js Implementation

This project is a pragmatic conversion of a basic Java "Hello World" into a professional Node.js web application following MVC patterns.

## Prerequisites

- **Node.js**: v14.x or higher
- **npm**: v6.x or higher

## Environment Setup

1. Ensure you have Node.js installed on your machine.
2. Navigate to the project root directory in your terminal.

## Dependency Installation

Install the required packages (Express and EJS) by running:


## Database Setup

This project uses an in-memory Model for the "Hello World" message, so no external database installation (like MySQL or MongoDB) is required for this specific implementation.

## Running the Server

To start the production server:


For development with hot-reloading:


The application will be available at: [http://localhost:3000](http://localhost:3000)

## Project Structure

- `app.js`: Application entry point and configuration.
- `src/models/`: Data logic and business rules.
- `src/controllers/`: Request handling and Model-View orchestration.
- `src/views/`: UI templates (EJS).
