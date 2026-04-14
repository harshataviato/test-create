# Product Management Application

This is a simple Node.js Express application that demonstrates the Model-View-Controller (MVC) pattern for managing products. It includes basic CRUD (Create, Read, Update, Delete) operations for products, with server-side rendered views using EJS.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Dependency Installation](#dependency-installation)
- [Database Setup](#database-setup)
- [Running the Server](#running-the-server)
- [API Endpoints](#api-endpoints)

## Features

- List all products.
- View details of a single product.
- Create a new product.
- Basic server-side rendering with EJS.
- Clear separation of concerns using MVC.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js**: Version 14 or higher. You can download it from [nodejs.org](https://nodejs.org/).
- **npm** (Node Package Manager): Comes bundled with Node.js.

## Environment Setup

1.  **Open your terminal or command prompt.**
2.  **Navigate to the project directory:**
    ```bash
    cd harshataviato-test-create-ebb4653
npm install
    _Note: As this project uses an in-memory array, no such commands are needed._

## Running the Server

You have two options to run the server:

1.  **Start in production mode:**
    ```bash
    npm start
    This command starts the server using `nodemon`, which will automatically restart the server whenever you make changes to the code.

Once the server is running, you can access the application in your web browser at: `http://localhost:3000`

## API Endpoints

The application provides the following endpoints:

-   **`GET /`**: Redirects to `/products`.
-   **`GET /products`**: Displays a list of all products.
-   **`GET /products/create`**: Displays the form to create a new product.
-   **`POST /products`**: Creates a new product.
    -   Request Body (form data): `name`, `description`, `price`
-   **`GET /products/:id`**: Displays the details of a specific product.
-   **`GET /products/:id/edit`**: (Not implemented in UI, but controller/service can be extended) Displays the form to edit an existing product.
-   **`POST /products/:id/update`**: (Not implemented in UI, but controller/service can be extended) Updates an existing product.
    -   Request Body (form data): `name`, `description`, `price`
-   **`POST /products/:id/delete`**: (Not implemented in UI, but controller/service can be extended) Deletes a product.
