# Harsha Taviato Node.js Application

This is a simple Node.js application demonstrating a basic Model-View-Controller (MVC) pattern using Express.js for the web framework, Sequelize ORM for database interaction (with SQLite), and Handlebars for templating. It provides basic CRUD (Create, Read, Update, Delete) functionality for "Item" resources.

## Directory Structure


## Setup and Installation

Follow these steps to get the project up and running on your local machine.

### 1. Environment Setup

*   **Node.js**: Ensure you have Node.js (v14 or higher recommended) and npm (Node Package Manager) installed. You can download it from [nodejs.org](https://nodejs.org/).
    To check if Node.js and npm are installed, run:
    ```bash
    node -v
    npm -v
cd harshataviato-test-create-ebb4653
npm install
mkdir db
npx sequelize-cli db:migrate
    To undo all migrations:
    ```bash
    npx sequelize-cli db:migrate:undo:all
npm run dev
npm start
http://localhost:3000
