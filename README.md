# Hello World Node.js (MVC Implementation)

This project is a pragmatic conversion of a simple Java "Hello World" into a fully functional Node.js web application. It follows the **Model-View-Controller (MVC)** architectural pattern to ensure clean separation of concerns.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- npm (comes bundled with Node.js)

## Environment Setup

1. Ensure you have Node.js installed on your machine.
2. Navigate to the project root directory in your terminal.

## Dependency Installation

Install the required packages (`express` and `ejs`) by running:


## Running the Server

To start the application, execute the following command:


Once the server starts, you will see a message:
`Server is running at http://localhost:3000`

## Accessing the Application

1. Open your web browser.
2. Navigate to `http://localhost:3000`.
3. You will see "Hello world!" displayed on the page.
4. Check your terminal output to see the message logged to the console, maintaining the original Java application's behavior.

## Project Structure

- `app.js`: The entry point of the application.
- `models/`: Contains data logic (Message fetching).
- `controllers/`: Contains request handling logic.
- `views/`: Contains UI templates (EJS).
