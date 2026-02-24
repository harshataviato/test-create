# Node.js PetClinic

This is a port of the [Spring PetClinic](https://github.com/spring-projects/spring-petclinic) application to Node.js, Express, and Sequelize.

## Prerequisites

- Node.js (v18 or higher)
- npm

## Setup and Installation

1. Install dependencies:
   ```bash
   npm install

## Running the Server

Start the application:

For development (auto-restart on changes):

Access the application at: [http://localhost:8080](http://localhost:8080)

## Database Configuration

By default, the application uses **SQLite** for zero-configuration startup.

### Using MySQL or PostgreSQL

To use a persistent database like MySQL or PostgreSQL, set the environment variables before running commands.

**MySQL:**

**PostgreSQL:**

## Project Structure

- `src/models`: Sequelize definitions (Entities)
- `src/controllers`: Request handling logic
- `src/routes`: URL mapping
- `src/views`: Handlebars templates (HTML)
- `src/config`: Database connection setup
