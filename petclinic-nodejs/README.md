# Node.js PetClinic Sample Application

This is a Node.js implementation of the classic Spring PetClinic application, re-architected using Express.js for the web framework, EJS for templating, and Sequelize for ORM.

## Environment Setup

To run this application, you will need:

*   **Node.js**: Version 18 or higher. You can download it from [nodejs.org](https://nodejs.org/).
*   **npm** (Node Package Manager): Comes bundled with Node.js.
*   **Docker** (Optional, for MySQL/PostgreSQL): If you prefer to use a persistent database like MySQL or PostgreSQL, Docker is required to run the database containers.

## Dependency Installation

1.  **Navigate to the project directory:**
    ```bash
    cd dba9ed6d-e447-45ee-89fe-2e217c1f4b34/petclinic-nodejs

## Database Setup

By default, the application uses **SQLite** for simplicity, which creates a file-based database (`database.sqlite`) in the project root. No additional setup is required for SQLite beyond running the migrations and seeders.

### Using MySQL or PostgreSQL (Optional)

If you want to use MySQL or PostgreSQL, you'll need Docker and `docker-compose`.

1.  **Create a `.env` file** in the `petclinic-nodejs/` directory.

    For **MySQL**:
    ```dotenv
    DB_DIALECT=mysql
    DB_HOST=localhost
    DB_PORT=3306
    DB_NAME=petclinic
    DB_USER=petclinic
    DB_PASS=petclinic

2.  **Start the database container:**
    ```bash
    # For MySQL
    docker compose up mysql -d
    # For PostgreSQL
    docker compose up postgres -d
    This command will create the necessary tables in your chosen database.

2.  **Run database seeders:**
    ```bash
    npm run db:seed
npm run db:reset
    or
    **Start the application in production mode:**
    ```bash
    npm start

