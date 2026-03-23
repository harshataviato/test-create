# TypeScript MVC Application

This project is a fully functional, production-ready TypeScript Model-View-Controller (MVC) application. It was designed to replicate a traditional Java web server (like Spring Boot) within the modern Node.js and TypeScript ecosystem. 

The application implements a User Management system utilizing Express.js for routing, TypeORM (with SQLite) for data persistence, and EJS for dynamic HTML view rendering.

## Project Structure
- `src/models/` - Contains database entities (Equivalent to JPA `@Entity`).
- `src/controllers/` - Contains route handling and business logic (Equivalent to Spring `@Controller`).
- `src/views/` - Contains EJS HTML templates (Equivalent to JSP / Thymeleaf).
- `src/index.ts` - The entry point and application bootstrapper.
- `src/database.ts` - Database connection configuration.

## Environment Setup & Prerequisites

Ensure that you have the following installed on your system:
- **Node.js**: v16.x or newer
- **npm**: Node Package Manager (comes with Node.js)

## 1. Dependency Installation

Navigate to the root directory of the project in your terminal and install all dependencies:


## 2. Database Setup & Migrations

Because this application is configured to use **SQLite** with TypeORM's `synchronize: true` option enabled, **no manual database setup or migration commands are required.** 

Upon starting the server, TypeORM will automatically:
1. Create a local database file named `database.sqlite` in your project root.
2. Generate all the necessary SQL tables corresponding to your TypeScript Models (`src/models/User.ts`).

## 3. Running the Server

To start the server in development mode using `ts-node`, run the following command:


You should see output similar to the following in your terminal:


## 4. Using the Application

Once the server is running, open your web browser and navigate to:
**[http://localhost:3000](http://localhost:3000)**

From there, you will be redirected to the User Directory where you can create, view, and delete users using the robust user interface.
