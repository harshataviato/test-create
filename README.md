# Enterprise Task Manager - TypeScript MVC

This is a complete, fully functional Model-View-Controller (MVC) application built in TypeScript. It is designed by translating enterprise Java paradigms (like Spring Boot Controllers, JPA/Hibernate Models, and Server-Side Templating) into a modern, pragmatic Node.js/TypeScript stack.

## Tech Stack
* **Language**: TypeScript
* **Web Framework**: Express.js
* **ORM**: TypeORM
* **Database**: SQLite (Zero-configuration file-based DB)
* **View Engine**: EJS (Embedded JavaScript templates)

## 1. Environment Setup Prerequisites

Ensure you have the following installed on your machine before proceeding:
- [Node.js](https://nodejs.org/) (v16.0.0 or higher is recommended)
- `npm` (comes bundled with Node.js)

Verify your installation by running:

## 2. Dependency Installation

Navigate to the root directory of this project where the `package.json` is located, and run the following command to download all required dependencies:


## 3. Database Setup & Migrations

This project utilizes **SQLite** with **TypeORM**. For simplicity and immediate usability, the `synchronize: true` option is enabled in `src/data-source.ts`. 

This means you **do not** need to run any manual database creation or migration commands! The SQLite database file (`database.sqlite`) and all necessary tables will be automatically generated locally the very first time you start the server.

## 4. Running the Server

You have two options to run the server:

### Option A: Development Mode (Hot-Reloading)
To run the server in development mode, which will automatically restart upon saving changes to files:

### Option B: Production Mode (Compiled)
To compile the TypeScript code down to standard JavaScript and run it (best for performance/production):

Alternatively, you can just execute it instantly via `ts-node` using:

## 5. Using the Application

Once the server is running, open your web browser and navigate to:

**http://localhost:3000**

From here, you can:
- View the task list.
- Click `+ Create New Task` to add items to your database.
- Use the `Edit` button to modify a task's title, description, or mark it as completed.
- Use the `Delete` button to remove a task.
