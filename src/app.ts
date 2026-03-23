/**
 * Module: Application Entry Point
 * Description: Bootstraps the Express server, configures middleware, defines the View Engine,
 * and establishes the database connection.
 * Equivalent to a main() method in a Spring Boot application class.
 */

import express, { Application } from "express";
import path from "path";
import { AppDataSource } from "./data-source";
import taskRoutes from "./routes/taskRoutes";

const app: Application = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// Middleware Configuration
// ==========================================

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));
// Parse JSON bodies
app.use(express.json());

// ==========================================
// View Engine Configuration
// ==========================================

// Set EJS as the templating engine (similar to Thymeleaf/JSP)
app.set("view engine", "ejs");
// Explicitly define the views directory relative to the project root
app.set("views", path.join(__dirname, "../views"));

// ==========================================
// Routing Configuration
// ==========================================

// Register application routes
app.use("/", taskRoutes);

// ==========================================
// Initialization & Startup
// ==========================================

/**
 * Initializes the database connection and starts the HTTP server.
 */
AppDataSource.initialize()
    .then(() => {
        console.log("Database connection established successfully.");
        
        app.listen(PORT, () => {
            console.log(`Server is running and listening on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Error during Data Source initialization:", error);
    });
