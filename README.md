# Google PetClinic - Node.js Implementation

This is a pragmatic, production-ready implementation of the classic PetClinic application using Node.js, Express, and Sequelize. It demonstrates senior-level engineering practices including caching, internationalization, multi-database support, and containerization.

## Features Implemented

1.  **Form Validation**: `express-validator` ensures data integrity (e.g., telephone numbers are 10 digits).
2.  **Application Caching**: `node-cache` caches Veterinarian lists to reduce DB hits (simulating JCache).
3.  **Internationalization (i18n)**: Supports English (en), German (de), and Spanish (es) via `?lang=xx` parameter.
4.  **Multi-Database Support**: Configurable via env vars to run on SQLite (default), PostgreSQL, or MySQL.
5.  **Veterinarian Directory**: Paginated list of vets with HTML and JSON API support.
6.  **Owner Management**: Search, Create, Update owners.
7.  **Pet & Visit Tracking**: Add pets to owners, add visits to pets.
8.  **Error Handling**: Global error catching and a dedicated `/crash` route to demo friendly error pages.
9.  **Container Support**: Docker Compose and Kubernetes configurations included.

## Prerequisites

-   Node.js v18+
-   npm

## Local Setup (Quick Start)

The project defaults to SQLite, requiring no external database setup.

1.  **Install Dependencies**:
    ```bash
    npm install

3.  **Run the Server**:
    ```bash
    npm start

2.  **Access**:
    Open [http://localhost:3000](http://localhost:3000)

## API Testing

**Veterinarians (JSON content negotiation)**:

**Error Handling Demo**:
Navigate to [http://localhost:3000/crash](http://localhost:3000/crash) to see the user-friendly error page.

## Configuration

Environment variables control the database connection:

| Variable | Default | Description |
|OS|---|---|
| `DB_DIALECT` | `sqlite` | Options: `sqlite`, `mysql`, `postgres` |
| `DB_STORAGE` | `./database.sqlite` | Path for SQLite file |
| `DB_HOST` | `localhost` | Host for MySQL/Postgres |
| `DB_USER` | `root` | Database User |
| `DB_PASS` | `password` | Database Password |
