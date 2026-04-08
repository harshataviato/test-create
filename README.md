# Product Management Application

This is a simple web application for managing products, built with Node.js, Express, Sequelize (ORM), and EJS (templating engine). It demonstrates a basic CRUD (Create, Read, Update, Delete) functionality for products.

## Table of Contents

-   [Features](#features)
-   [Prerequisites](#prerequisites)
-   [Environment Setup](#environment-setup)
-   [Dependency Installation](#dependency-installation)
-   [Database Setup](#database-setup)
-   [Running the Server](#running-the-server)
-   [Project Structure](#project-structure)

## Features

-   List all products.
-   View individual product details.
-   Add new products.
-   Edit existing products.
-   Delete products.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

-   **Node.js**: Version 14 or higher (LTS recommended). You can download it from [nodejs.org](https://nodejs.org/).
-   **npm** (Node Package Manager): Comes bundled with Node.js.

## Environment Setup

1.  **Create an Environment File**:
    Create a file named `.env` in the root directory of the project.
    This file will store environment-specific variables, such as the database path.

    ```bash
    touch .env
    DATABASE_URL=./data/database.sqlite
npm install

    This command will create the `data` directory (if it doesn't exist) and the `database.sqlite` file, then synchronize the `Product` model schema with the database, creating the `Products` table.

2.  **(Optional) Seed Initial Data**:
    If you wish to populate your database with some initial sample data, you can run the seeding command:

    ```bash
    npm run db:seed

    The server will typically start on `http://localhost:3000`.

2.  **Production Mode**:
    For a production environment, or simply to run the server once without automatic restarts:

    ```bash
    npm start
harshataviato-test-create-ebb4653/
├── README.md               # Project documentation
├── package.json            # Project dependencies and scripts
├── .env                    # Environment variables (e.g., DATABASE_URL)
├── app.js                  # Main application entry point, Express setup
├── config/
│   └── database.js         # Sequelize database configuration and connection
├── models/
│   └── product.js          # Sequelize Product model definition
├── controllers/
│   └── productController.js # Handles request logic for products
├── routes/
│   └── productRoutes.js    # Defines API routes for products
└── views/
    ├── layout.ejs          # Base layout for all pages
    ├── products/
    │   ├── index.ejs       # View to list all products
    │   ├── new.ejs         # Form to create a new product
    │   ├── show.ejs        # View to display a single product
    │   └── edit.ejs        # Form to edit an existing product
    └── partials/
        └── header.ejs      # Reusable header component
