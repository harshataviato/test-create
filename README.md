# Hello World TypeScript Application

This project is a simple "Hello World" application built with TypeScript, demonstrating a basic Model-View-Controller (MVC) architecture for a console application.

## Project Structure

The application follows a simple MVC pattern:
- `models/`: Defines the data structure for the application.
- `views/`: Handles the presentation logic (how data is displayed).
- `controllers/`: Manages the application flow, interacting with models and views.
- `index.ts`: The entry point of the application.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

*   **Node.js**: A JavaScript runtime environment. It includes npm (Node Package Manager).
    *   You can download it from [nodejs.org](https://nodejs.org/).
    *   To verify installation, run:
        ```bash
        node -v
        npm -v

2.  **Initialize a new Node.js project:**

    ```bash
    npm init -y

4.  **Configure TypeScript:**
    Create a `tsconfig.json` file in the root of your project to configure the TypeScript compiler.

    ```bash
    npx tsc --init

5.  **Add a start script to `package.json`:**
    Open your `package.json` file and add a `start` script under the `scripts` section. This allows you to run the application easily.

    ```json
    {
      "name": "ade62693-893f-4302-8fce-3783cf8ca4ab",
      "version": "1.0.0",
      "description": "Hello World TypeScript Application",
      "main": "index.js",
      "scripts": {
        "start": "ts-node src/index.ts",
        "build": "tsc",
        "test": "echo \"Error: no test specified\" && exit 1"
      },
      "keywords": [],
      "author": "",
      "license": "ISC",
      "devDependencies": {
        "ts-node": "^10.9.1",
        "typescript": "^5.2.2"
      }
    }
npm start
