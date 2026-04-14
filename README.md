# Hello World Node.js Application

This project is a conversion of a basic Java "Hello World" application into a Node.js web application following an MVC (Model-View-Controller) architectural pattern. It demonstrates how to set up a simple Express.js server to display the classic "Hello world!" message in a web browser.

## Directory Structure


## Prerequisites

Before you begin, ensure you have the following installed on your system:

*   **Node.js**: [Download & Install Node.js](https://nodejs.org/en/download/) (Includes npm - Node Package Manager). It's recommended to use the LTS version.

## Setup and Running the Project

Follow these steps to get the Hello World Node.js application up and running.

### 1. Environment Setup

No specific environment variables are strictly required for this simple application. The server port defaults to `3000` but can be overridden by setting the `PORT` environment variable (e.g., `PORT=8080 npm start`).

### 2. Dependency Installation

Navigate to the root directory of the project in your terminal and install the required Node.js packages:


This command reads the `package.json` file and installs all listed `dependencies` (like Express and EJS) and `devDependencies` (like Nodemon).

### 3. Database Setup (Not Applicable)

This application does not use a database. It simply serves a static "Hello world!" message from a model. Therefore, no database setup steps are required.

### 4. Migrations (Not Applicable)

As there is no database involved, there are no migrations to run for this project.

### 5. Running the Server

Once the dependencies are installed, you can start the Node.js server using one of the following commands:

#### Development Mode (with Nodemon)

For development, you can use `nodemon`. It automatically restarts the server when you make changes to your project files, which is very convenient for development workflows.


#### Production Mode (Standard Node.js)

For production environments or a standard one-time run, use the `node` command directly:


After running either command, you should see output similar to this in your terminal:


Open your web browser and navigate to `http://localhost:3000` to see the "Hello world!" message displayed.
