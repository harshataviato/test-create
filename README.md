# Product Management Application (Node.js)

This is a simple Node.js application built with Express.js and EJS, demonstrating basic CRUD operations (specifically focusing on "create" and "list") for products. It uses an in-memory data store for simplicity, meaning all data is reset when the server restarts.

## Directory Structure


## Setup and Running the Project

Follow these steps to set up and run the application on your local machine.

### Environment Setup

Ensure you have Node.js and npm (Node Package Manager) installed on your system.

1.  **Install Node.js**: If you don't have Node.js installed, download and install it from the official website: [https://nodejs.org/](https://nodejs.org/)

    You can verify your installation by running:
    ```bash
    node -v
    npm -v

### Database Setup & Migrations

This project uses an **in-memory data store** for simplicity. There is no external database to set up, nor are there any database migration steps required. All product data is stored in memory and will be lost when the server restarts.

### Running the Server

Once all dependencies are installed, you can start the application server.

1.  **Start the server**:
    ```bash
    npm start

2.  **Access the application**:
    Open your web browser and navigate to:
    *   **Home/Product List**: `http://localhost:3000/products`
    *   **Create New Product**: `http://localhost:3000/products/create`
