# Hello World with TypeScript :zap:

This project demonstrates a simple "Hello World" application implemented in TypeScript, following a basic Model-View-Controller (MVC) architectural pattern. It showcases how to set up a TypeScript project, define models, views, and controllers, and execute the application.

## Project Structure

The application is organized as follows:


## Prerequisites

Before you begin, ensure you have the following installed on your system:

*   **Node.js**: Includes npm (Node Package Manager). You can download it from [nodejs.org](https://nodejs.org/).
    *   To check if Node.js is installed, run: `node -v`
    *   To check if npm is installed, run: `npm -v`

## Setup and Installation

Follow these steps to set up and run the project:

1.  **Navigate to the project directory:**
    ```bash
    cd 2c8e9b3d-582e-4e93-9b07-e310ffbfe747/hello-world-typescript

## Running the Application

There are two primary ways to run this TypeScript application:

### 1. Run in Development Mode (using `ts-node`)

This method uses `ts-node` to execute the TypeScript files directly without a prior compilation step. It's ideal for development as it provides a faster feedback loop.


### 2. Compile and Run in Production Mode

This method first compiles the TypeScript code into JavaScript, and then executes the compiled JavaScript. This is the standard approach for deploying a production application.

#### a. Compile the TypeScript code:
This command uses the TypeScript compiler (`tsc`) to transform all `.ts` files in the `src` directory into `.js` files in the `dist` directory, as configured in `tsconfig.json`.

#### b. Execute the compiled JavaScript:
This command runs the main JavaScript file generated during the build process.

## Cleaning Up

To remove the compiled JavaScript files and the `node_modules` directory:


This command will delete the `dist` folder and the `node_modules` folder, effectively resetting the project to its initial state (excluding `package-lock.json`).

