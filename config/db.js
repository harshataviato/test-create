/**
 * @module config/db
 * @description Manages the SQLite database connection and initializes the database schema.
 */

const sqlite3 = require('sqlite3').verbose(); // Import sqlite3, using verbose mode for more detailed error messages
const path = require('path');                 // Import path module for resolving file paths
const fs = require('fs');                     // Import fs module for file system operations

let dbInstance = null; // Holds the single database instance

/**
 * @function getDbPath
 * @description Determines the database file path based on the current environment.
 * @returns {string} The absolute path to the SQLite database file.
 */
function getDbPath() {
    const dbFileName = process.env.NODE_ENV === 'test' ? 'test_tasks.db' : 'tasks.db';
    return path.join(__dirname, '..', 'db', dbFileName);
}

/**
 * @function connectDb
 * @description Connects to the SQLite database. If the database file does not exist,
 *              it creates it and then initializes the schema.
 * @returns {Promise<sqlite3.Database>} A promise that resolves with the database object upon successful connection and initialization.
 */
async function connectDb() {
    return new Promise((resolve, reject) => {
        const DB_PATH = getDbPath(); // Use dynamic path here
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
            console.log(`Connected to the SQLite database: ${DB_PATH}`);

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
        const INIT_SCHEMA_SQL_PATH = path.join(__dirname, '..', 'db', 'init.sql');
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
async function getDb() {
    if (!dbInstance) {
        dbInstance = await connectDb();
    }
    return dbInstance;
}

/**
 * @function closeDb
 * @description Closes the active database connection.
 * @returns {Promise<void>} A promise that resolves when the database connection is closed.
 */
async function closeDb() {
    if (dbInstance) {
        return new Promise((resolve, reject) => {
            dbInstance.close((err) => {
                if (err) {
                    console.error('Error closing database:', err.message);
                    return reject(err);
                }
                console.log('Closed the SQLite database connection.');
                dbInstance = null; // Clear the instance
                resolve();
            });
        });
    }
    return Promise.resolve(); // If no instance, resolve immediately
}

/**
 * @function deleteTestDbFile
 * @description Deletes the test database file if NODE_ENV is 'test'.
 * @returns {void}
 */
function deleteTestDbFile() {
    if (process.env.NODE_ENV === 'test') {
        const testDbPath = getDbPath();
        if (fs.existsSync(testDbPath)) {
            console.log(`Deleting test database file: ${testDbPath}`);
            fs.unlinkSync(testDbPath);
        }
    }
}

// If this script is run directly (e.g., via `npm run db:init`), connect and initialize.
if (require.main === module) {
    console.log('Running database initialization script...');
    getDb()
        .then(() => console.log('Database setup complete.'))
        .catch(err => console.error('Database setup failed:', err));
}

module.exports = {
    getDb,
    closeDb,
    deleteTestDbFile
};
