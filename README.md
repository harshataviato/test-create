# PetClinic TypeScript NestJS Application

This is a re-implementation of the Spring PetClinic Sample Application using TypeScript with the NestJS framework, TypeORM for database interactions, and EJS for server-side rendering.

## Setup and Run the Project

### Prerequisites

*   Node.js (LTS version, e.g., 20.x)
*   npm or Yarn (npm is used in commands below)
*   Docker (optional, for running MySQL or PostgreSQL)

### 1. Environment Setup

1.  **Install NestJS CLI (if not already installed):**
    ```bash
    npm install -g @nestjs/cli

### 2. Database Setup

The application supports H2 (in-memory, default), MySQL, and PostgreSQL.

#### Option A: H2 (In-memory - Default)

No additional setup is required. The H2 database is in-memory and will be populated with sample data on application startup. This is suitable for development and testing.

#### Option B: MySQL

1.  **Start MySQL using Docker:**
    ```bash
    docker run --name petclinic-mysql -e MYSQL_USER=petclinic -e MYSQL_PASSWORD=petclinic -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=petclinic -p 3306:3306 -d mysql:9.5
    DB_TYPE=mysql
    DB_HOST=localhost
    DB_PORT=3306
    DB_USERNAME=petclinic
    DB_PASSWORD=petclinic
    DB_DATABASE=petclinic

2.  **Configure application to use PostgreSQL:**
    Create a `.env` file in the project root (`spring-petclinic-main/`) with the following content:

#### Applying Database Schema and Data

For MySQL and PostgreSQL, the TypeORM `synchronize` option will create the schema. For data, you can manually insert it using the provided SQL scripts in `db/`.
The `synchronize: true` setting in `database.config.ts` handles schema creation automatically for development. For production, `synchronize` should be `false`, and migrations should be used.

**Manual Data Population (if `synchronize: false` and no migrations are set up):**

*   **For MySQL**:
    ```bash
    docker exec -i petclinic-mysql mysql -upetclinic -ppetclinic petclinic < src/db/mysql/schema.sql
    docker exec -i petclinic-mysql mysql -upetclinic -ppetclinic petclinic < src/db/mysql/data.sql

### 3. Running the Server

1.  **Start the NestJS application:**
    ```bash
    npm run start:dev
sass src/scss/petclinic.scss:public/css/petclinic.css
