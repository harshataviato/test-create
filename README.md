# Task Management Application

This is a simple Node.js application built with Express.js, EJS for templating, and SQLite for the database. It demonstrates a basic Model-View-Controller (MVC) pattern for managing tasks.

## Table of Contents

-   [Prerequisites](#prerequisites)
-   [Setup](#setup)
    -   [Clone the Repository (Not applicable - files provided directly)](#clone-the-repository-not-applicable---files-provided-directly)
    -   [Install Dependencies](#install-dependencies)
-   [Database Setup](#database-setup)
-   [Running the Application](#running-the-application)
-   [Project Structure](#project-structure)

## Prerequisites

Before you begin, ensure you have the following installed on your system:

-   **Node.js**: [Download & Install Node.js](https://nodejs.org/en/download/) (LTS version recommended)
-   **npm**: Node Package Manager, which comes with Node.js.

## Setup

### Install Dependencies

Navigate to the project's root directory in your terminal and install the required npm packages:


## Database Setup

This application uses SQLite, which is a file-based database. We need to initialize the database schema.

1.  **Initialize Database Schema**: Run the following command to create the `tasks.db` file and set up the `tasks` table.

    ```bash
    npm run db:init

    This will start the server using `nodemon`, which automatically restarts the server when code changes are detected.

2.  **Start in Production Mode**:

    ```bash
    npm start
.
├── app.js                      # Main application entry point
├── package.json                # Project dependencies and scripts
├── README.md                   # This file
├── config/
│   └── db.js                   # Database connection and initialization
├── controllers/
│   └── taskController.js       # Handles task-related business logic and request processing
├── models/
│   └── taskModel.js            # Defines the Task data structure and database interactions
├── routes/
│   └── taskRoutes.js           # Defines API routes for tasks
├── views/
│   ├── layout.ejs              # Base layout for all EJS views
│   ├── tasks/
│   │   ├── index.ejs           # View to list all tasks
│   │   ├── new.ejs             # View for creating a new task
│   │   └── edit.ejs            # View for editing an existing task
│   └── home.ejs                # Home page view
└── db/
    └── init.sql                # SQL script for initial database schema setup

