# Node.js PetClinic

A complete port of the Spring PetClinic application to Node.js, Express, and Sequelize.

## Features

*   **MVC Architecture**: Built using Express.js.
*   **Database**: Uses SQLite by default (zero-conf), but supports MySQL and Postgres via Sequelize.
*   **View Engine**: EJS templates replacing Thymeleaf.
*   **Validation**: Server-side validation using `express-validator`.
*   **Styling**: Bootstrap 5 integration matching the original look and feel.

## Prerequisites

*   Node.js (v14 or higher)
*   npm (Node Package Manager)

## Setup and Installation

1.  Install dependencies:
    ```bash
    npm install

2.  **Access the application:**
    Open your browser and navigate to:
    [http://localhost:8080](http://localhost:8080)

## Development

To run with hot-reloading (requires `nodemon`):


To force a re-seed of the database (WARNING: Deletes existing data):


## Structure

*   `server.js` - Application entry point.
*   `config/` - Database configuration.
*   `controllers/` - Request handling logic.
*   `models/` - Sequelize schema definitions and relationships.
*   `routes/` - URL routing.
*   `views/` - EJS templates.
*   `public/` - Static assets (CSS, Images).
