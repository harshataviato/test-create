# Hello World Node.js (MVC Implementation)

This project is a pragmatic conversion of a simple Java "Hello World" application into a fully structured Node.js web application using the Model-View-Controller (MVC) pattern.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [npm](https://www.npmjs.com/) (usually bundled with Node.js)

## Environment Setup

1. Open your terminal or command prompt.
2. Ensure you are in the project root directory.

## Dependency Installation

Install the necessary dependencies (Express and EJS) defined in the `package.json`:


## Database Setup

*Note: This application uses a static model for the "Hello World" message, so no external database configuration is required at this stage.*

## Running the Server

To start the application, run the following command:


Once the server starts, you can access the application at:

- **Web View:** [http://localhost:3000](http://localhost:3000)
- **JSON API:** [http://localhost:3000/api/hello](http://localhost:3000/api/hello)

## Project Structure

- `app.js`: The entry point and server configuration.
- `models/`: Contains the data logic.
- `controllers/`: Handles request processing and bridges models and views.
- `views/`: EJS templates for the user interface.
- `package.json`: Project metadata and dependencies.
