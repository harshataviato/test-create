# Hello World with TypeScript

This is a simple "Hello World" application implemented in TypeScript. It includes a basic model, view, and controller structure.

## Prerequisites

*   Node.js (version 18 or higher recommended)
*   npm (Node Package Manager, usually installed with Node.js)

## Setup

1.  **Create a project directory:**

    ```bash
    mkdir hello-world-typescript
    cd hello-world-typescript

3.  **Install TypeScript and ts-node:**

    ```bash
    npm install typescript ts-node --save-dev

5.  **Install express**
   ```bash
   npm install express @types/express
hello-world-typescript/
├── src/
│   ├── models/
│   │   └── Greeting.ts
│   ├── views/
│   │   └── greetingView.ts
│   ├── controllers/
│   │   └── greetingController.ts
│   └── app.ts
├── package.json
├── tsconfig.json
└── README.md

2.  **Run the application:**

    ```bash
    node src/app.js

3.  **Access the application:**

    Open your web browser and navigate to `http://localhost:3000`. You should see the "Hello, World!" message.

## Clean up

To remove all generated JavaScript files

