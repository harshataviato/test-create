# Node.js PetClinic Sample Application

This is a Node.js port of the standard Spring PetClinic application. It replicates the functionality using modern Node.js practices, Express, and Sequelize.

## Tech Stack

*   **Runtime:** Node.js
*   **Web Framework:** Express.js
*   **Template Engine:** EJS
*   **ORM:** Sequelize
*   **Database:** SQLite (Default), MySQL, PostgreSQL

## Prerequisites

*   Node.js (v16 or higher)
*   NPM

## Setup and Run

1.  **Install Dependencies:**
    ```bash
    npm install

3.  **Run the Application (Production Mode):**
    ```bash
    npm start

### Using PostgreSQL

1.  Ensure a Postgres server is running.
2.  Create a database named `petclinic`.
3.  Run the app with environment variables:
    ```bash
    export DATABASE=postgres
    export POSTGRES_USER=petclinic
    export POSTGRES_PASSWORD=petclinic
    export POSTGRES_DB=petclinic
    npm start

