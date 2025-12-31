# PetClinic Node.js

A Node.js implementation of the PetClinic application, built with Express, Sequelize, and EJS.

## Table of Contents

- [Features](#features)
- [Directory Structure](#directory-structure)
- [Installation](#installation)
- [Database Configuration](#database-configuration)
- [Running the Application](#running-the-application)
- [Running Tests](#running-tests)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Internationalization (i18n)](#internationalization-i18n)
- [Caching](#caching)

## Features

*   **Owner Management**: Find, view, add, and update pet owners.
*   **Pet Management**: Add and update pets for owners, including pet type and birth date.
*   **Visit Management**: Record and view visit details for each pet.
*   **Veterinarian Listing**: View a list of veterinarians and their specialties with pagination.
*   **Internationalization**: Supports English and Spanish.
*   **Database Agnostic**: Configurable to use SQLite (default), MySQL, or PostgreSQL.
*   **Caching**: Caches veterinarian data for improved performance.
*   **Error Handling**: Graceful error pages for 404 and 500 errors.

## Directory Structure


## Installation

1.  **Clone the repository**:
    ```bash
    git clone [your-repo-url] petclinic-nodejs
    cd petclinic-nodejs

## Database Configuration

The application supports SQLite (default), MySQL, and PostgreSQL.

1.  **Copy `.env.example` to `.env`**:
    ```bash
    cp .env.example .env
        (A `data` directory will be created with `petclinic.sqlite` inside)

    *   **MySQL**:
        ```env
        DB_DIALECT=mysql
        MYSQL_HOST=localhost
        MYSQL_PORT=3306
        MYSQL_USER=petclinic
        MYSQL_PASSWORD=petclinic
        MYSQL_DATABASE=petclinic

3.  **Run with Docker Compose (for MySQL or PostgreSQL)**:
    If you choose MySQL or PostgreSQL, you can use `docker-compose.yml` to spin up a local database container.
    ```bash
    docker-compose up -d

5.  **Seed Initial Data (for development)**:
    This will populate your database with some initial sample data.
    ```bash
    npm run db:seed
    The application will be accessible at `http://localhost:8080` (or your configured `PORT`).

2.  **Start the application in production mode**:
    ```bash
    npm start
2.  **Run all tests**:
    ```bash
    npm test
    (Remember to replace placeholder base64 values with your actual credentials.)

2.  **Deploy the Database (e.g., PostgreSQL)**:
    ```bash
    kubectl apply -f k8s/petclinic-db.yml

4.  **Deploy the Node.js Application**:
    Remember to update the `image` field in `k8s/petclinic-deployment.yml` with your actual image name.
    ```bash
    kubectl apply -f k8s/petclinic-service.yml
    kubectl apply -f k8s/petclinic-deployment.yml
    Access the application via the configured Ingress host.

## Internationalization (i18n)

The application supports `en` (English) and `es` (Spanish).
You can switch languages by adding `?lang=es` or `?lang=en` to the URL, or by clicking the language links in the header.

## Caching

The list of veterinarians is cached in memory using `node-cache` for `CACHE_TTL_SECONDS` (default 3600 seconds, 1 hour) to improve performance. The cache is automatically cleared when the application shuts down.


---

