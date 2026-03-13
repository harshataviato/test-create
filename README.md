# Hello World Node.js (MVC)

This project is a pragmatic conversion of a basic Java "Hello World" into a fully functional Node.js application using the Model-View-Controller (MVC) architectural pattern.

## Prerequisites

- [Node.js](https://nodejs.org/) (Version 14.x or higher recommended)
- npm (Node Package Manager)

## Environment Setup

1. Open your terminal or command prompt.
2. Navigate to the project root directory.

## Dependency Installation

Install the required packages (Express and EJS) by running:


## Database Setup

*Note: This specific implementation uses a static data model to match the original Java functionality, so no external database configuration is required.*

## Running the Server

### For Production/Standard execution:
This will start the server on the default port 3000.


### For Development:
If you want the server to auto-restart on code changes (requires nodemon):


## Accessing the Application

1. Once the server is running, open your web browser.
2. Navigate to: `http://localhost:3000`
3. You will see "Hello world!" rendered on the screen, and the same message will appear in your terminal logs.

## Project Structure

- `src/app.js`: Application entry point and configuration.
- `src/models/`: Data logic (Message generation).
- `src/controllers/`: Request handling and routing logic.
- `src/views/`: HTML templates (EJS).
