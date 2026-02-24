# Node.js PetClinic Sample Application

This is a pragmatic port of the standard Spring PetClinic application to Node.js, Express, and Sequelize.

## Features

*   **MVC Architecture**: Uses Express.js controllers and EJS views.
*   **Database**: SQLite by default (zero configuration), Sequelize ORM models.
*   **Validation**: Server-side validation using `express-validator`.
*   **Layouts**: Templating with `express-ejs-layouts`.

## Prerequisites

*   Node.js (v18 or newer)
*   NPM

## Setup & Running

1.  **Install Dependencies**
    ```bash
    npm install

3.  **Run the Server**
    ```bash
    npm start

4.  **Access the Application**
    Open your browser and navigate to:
    [http://localhost:8080](http://localhost:8080)

## Project Structure

*   `server.js`: Entry point.
*   `config/`: Database configuration.
*   `models/`: Sequelize entity definitions.
*   `controllers/`: Request handling logic.
*   `routes/`: URL mapping.
*   `views/`: EJS templates.
*   `public/`: Static assets (CSS, Images).
