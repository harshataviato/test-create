/**
 * Module: Database Configuration
 * Description: Sets up the TypeORM data source.
 * This replaces Java's persistence.xml or application.properties database configuration.
 */

import { DataSource } from "typeorm";
import { User } from "./models/User";

/**
 * The main database connection instance.
 * We use SQLite for a seamless, zero-config local setup.
 * 
 * Business Rule: In production, 'synchronize' should be false, and migrations should be used.
 * For this fully functional standalone setup, 'synchronize: true' automatically builds the schema.
 */
export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "database.sqlite", // Creates a local SQLite file
    synchronize: true,           // Auto-creates database tables based on Models
    logging: false,              // Disables verbose SQL logging in console
    entities: [User],            // Registers the User model
});
