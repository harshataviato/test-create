/**
 * @module config/db
 * @description Manages the SQLite database connection and initializes the database schema.
 */

const sqlite3 = require('sqlite3').verbose(); // Import sqlite3, using verbose mode for more detailed error messages
const path = require('path');                 // Import path module for resolving file paths
const fs = require('fs');                     // Import fs module for file system operations

/**
 * @constant {string} DB_PATH
 * @description The absolute path to the SQLite database file.
 *              The database file will be stored in the `db` directory.
 */
const DB_PATH = path.join(__dirname, '..', 'db', 'tasks.db');

/**
 * @constant {string} INIT_SCHEMA_SQL_PATH
 * @description The absolute path to the SQL script for initializing the database schema.
 */
const INIT_SCHEMA_SQL_PATH = path.join(__dirname, '..', 'db', 'init.sql');

/**
 * @function connectDb
 * @description Connects to the SQLite database. If the database file does not exist,
 *              it creates it and then initializes the schema.
 * @returns {Promise<sqlite3.Database>} A promise that resolves with the database object upon successful connection and initialization.
 */
async function connectDb() {
    return new Promise((resolve, reject) => {
        // Ensure the directory for the database exists
        const dbDir = path.dirname(DB_PATH);
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }

        /**
         * @constant {sqlite3.Database} db
         * @description The SQLite database instance.
         */
        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('Error connecting to database:', err.message);
                return reject(err);
            }
            console.log('Connected to the SQLite database.');

            // Check if the database is new and needs schema initialization
            db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='tasks'", (err, row) => {
                if (err) {
                    console.error('Error checking for existing tables:', err.message);
                    return reject(err);
                }
                if (!row) {
                    console.log('Database is new or tasks table does not exist. Initializing schema...');
                    initializeSchema(db)
                        .then(() => resolve(db))
                        .catch(initErr => reject(initErr));
                } else {
                    console.log('Tasks table already exists. Database ready.');
                    resolve(db);
                }
            });
        });
    });
}

/**
 * @function initializeSchema
 * @description Reads the `init.sql` file and executes its contents to create the database schema.
 * @param {sqlite3.Database} db - The connected SQLite database instance.
 * @returns {Promise<void>} A promise that resolves when the schema is successfully created.
 */
async function initializeSchema(db) {
    return new Promise((resolve, reject) => {
        fs.readFile(INIT_SCHEMA_SQL_PATH, 'utf8', (err, sql) => {
            if (err) {
                console.error('Error reading init.sql:', err.message);
                return reject(err);
            }

            db.exec(sql, (execErr) => {
                if (execErr) {
                    console.error('Error initializing database schema:', execErr.message);
                    return reject(execErr);
                }
                console.log('Database schema initialized successfully.');
                resolve();
            });
        });
    });
}

/**
 * @function getDb
 * @description Provides a singleton-like access to the database connection.
 *              It ensures that the database is connected and initialized before returning the instance.
 * @returns {Promise<sqlite3.Database>} A promise that resolves with the database instance.
 */
let dbInstance = null; // Holds the single database instance

async function getDb() {
    if (!dbInstance) {
        dbInstance = await connectDb();
    }
    return dbInstance;
}

// If this script is run directly (e.g., via `npm run db:init`), connect and initialize.
if (require.main === module) {
    console.log('Running database initialization script...');
    getDb()
        .then(() => console.log('Database setup complete.'))
        .catch(err => console.error('Database setup failed:', err));
}

module.exports = {
    getDb
};
