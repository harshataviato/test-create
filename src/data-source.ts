/**
 * Module: Database Configuration
 * Description: Sets up the TypeORM connection to an SQLite database.
 * This acts similar to an application.properties file in Spring Boot, defining
 * the dialect, connection string, and entity locations.
 */

import "reflect-metadata";
import { DataSource } from "typeorm";
import { Task } from "./models/Task";

/**
 * AppDataSource initializes the connection to the SQLite database.
 * 
 * Business Rules:
 * - synchronize: true is used for automatic schema creation (equivalent to hibernate.hbm2ddl.auto=update).
 * - In a strict production environment, synchronize should be false and migrations should be used.
 */
export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "database.sqlite", // Creates a local file-based database
    synchronize: true,           // Auto-creates database tables based on Models
    logging: false,              // Set to true to see underlying SQL queries
    entities: [Task],            // Registering our models
    migrations: [],
    subscribers: [],
});
