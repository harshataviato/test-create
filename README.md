# Product Management Application

A simple Node.js application demonstrating the MVC (Model-View-Controller) pattern with Express.js, Mongoose (for MongoDB), and EJS (Embedded JavaScript) for templating. This application provides basic CRUD (Create, Read, Update, Delete) operations for managing products.

## Table of Contents

-   [Features](#features)
-   [Directory Structure](#directory-structure)
-   [Installation](#installation)
-   [Configuration](#configuration)
-   [Running the Application](#running-the-application)
-   [Running Tests](#running-tests)
-   [Technologies Used](#technologies-used)
-   [Author](#author)
-   [License](#license)

## Features

-   **Product Listing:** View all products in a table.
-   **Product Details:** See detailed information for a single product.
-   **Add New Product:** Create new products with name, description, price, and quantity.
-   **Edit Product:** Modify existing product details.
-   **Delete Product:** Remove products from the system.
-   **Responsive UI:** Basic styling for a pleasant user experience.
-   **Error Handling:** Basic error pages for server and not-found issues.

## Directory Structure


## Installation

1.  **Clone the repository:**
    ```bash
    # (Assuming you have a git repository. Replace with your actual clone command)
    # git clone <your-repo-url>
    # cd <your-repo-name>

## Configuration

1.  **Environment Variables:**
    *   Create a file named `.env` in the root directory of your project.
    *   Add the following environment variables, replacing `mongodb://localhost:27017/product_db` with your MongoDB connection string if it's different.
        *   `MONGO_URI` is for development/production.
        *   `MONGO_URI_TEST` is specifically for running tests, ensuring test data isolation.

        ```env
        PORT=3000
        MONGO_URI=mongodb://localhost:27017/product_db
        MONGO_URI_TEST=mongodb://localhost:27017/product_test_db
    *   For production:
        ```bash
        npm start
    This command will use `mocha` to run all test files located in the `test/` directory. It will connect to the `product_test_db` database, ensuring your development data remains untouched.

## Technologies Used

-   **Node.js:** JavaScript runtime environment.
-   **Express.js:** Web application framework for Node.js.
-   **Mongoose:** MongoDB object data modeling (ODM) for Node.js.
-   **EJS:** Embedded JavaScript templates for server-side rendering.
-   **express-ejs-layouts:** Simplifies using EJS layouts.
-   **body-parser:** Middleware to parse incoming request bodies.
-   **method-override:** Allows using PUT and DELETE HTTP methods in forms.
-   **dotenv:** Loads environment variables from a `.env` file.
-   **Mocha:** Test framework.
-   **Chai:** Assertion library.
-   **Supertest:** HTTP assertion library for testing Node.js HTTP servers.
-   **Sinon:** Standalone test spies, stubs, and mocks for JavaScript.
-   **Nodemon:** Utility that monitors for changes in your source and automatically restarts your server.

## Author

Google Senior Engineer

## License

ISC
