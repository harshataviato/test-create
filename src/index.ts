/**
 * Module: Application Entry Point
 * Description: Bootstraps the Express application, configures middleware, and defines routes.
 * Equivalent to the Main class with @SpringBootApplication in Java.
 */

import "reflect-metadata"; // Required by TypeORM for decorators
import express from 'express';
import path from 'path';
import { AppDataSource } from './database';
import { UserController } from './controllers/UserController';

// Initialize the Express application
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize controllers
const userController = new UserController();

// --- Middleware Configuration ---

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));
// Parse JSON bodies (for API calls)
app.use(express.json());

// --- View Engine Configuration ---

// Set EJS as the templating engine
app.set('view engine', 'ejs');
// Specify the directory where views/templates are stored
app.set('views', path.join(__dirname, '../views'));

// --- Route Definitions ---

// Home route - redirects to the users list
app.get('/', (req, res) => {
    res.redirect('/users');
});

// User routes mapping (Equivalent to @RequestMapping in Java)
app.get('/users', (req, res) => userController.getAllUsers(req, res));
app.get('/users/create', (req, res) => userController.getCreateForm(req, res));
app.post('/users/create', (req, res) => userController.createUser(req, res));
app.post('/users/delete/:id', (req, res) => userController.deleteUser(req, res));

// --- Database Connection and Server Startup ---

/**
 * Initializes the database connection and starts the HTTP server.
 * Ensures the app only starts accepting requests if the DB is healthy.
 */
AppDataSource.initialize()
    .then(() => {
        console.log("Database connection established successfully.");
        
        // Start listening for incoming connections
        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Error during Data Source initialization:", error);
        process.exit(1); // Exit process if DB connection fails
    });
