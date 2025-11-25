# Hello World with Node.js and Express

This is a simple "Hello world" web application built with Node.js and the Express.js framework, demonstrating a basic Model-View-Controller (MVC) pattern.

## Project Structure

This project follows a standard MVC structure to separate concerns:

*   **`server.js`**: The main entry point of the application, responsible for setting up the Express server and configuring middleware.
*   **`src/models`**: Contains data models. For this simple app, it provides the "Hello world!" message.
*   **`src/views`**: Contains EJS templates for rendering HTML pages.
*   **`src/controllers`**: Contains functions that handle incoming requests, interact with models, and render views.
*   **`src/routes`**: Defines the URL endpoints and maps them to appropriate controller functions.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

*   **Node.js**: A JavaScript runtime environment. You can download it from [nodejs.org](https://nodejs.org/). It comes with npm (Node Package Manager) included.

    To verify Node.js and npm are installed, run:
    ```bash
    node -v
    npm -v

2.  **Install dependencies**:
    This command reads the `package.json` file and installs all required Node.js modules listed under `dependencies`.
    ```bash
    npm install
    Alternatively, you can run it directly:
    ```bash
    node server.js
    http://localhost:3000

