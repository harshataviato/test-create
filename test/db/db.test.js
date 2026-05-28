const { expect } = require('chai');
const sinon = require('sinon');
const fs = require('fs');
const path = require('path');
const { getDb, closeDb, deleteTestDbFile } = require('../../config/db');
const sqlite3 = require('sqlite3'); // Import sqlite3 to stub its Database constructor

// Extend Chai with chai-as-promised for easier async testing assertions
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);


describe('Database Configuration', () => {
    const TEST_DB_PATH = path.join(__dirname, '../../db', 'test_tasks.db');
    const INIT_SQL_PATH = path.join(__dirname, '../../db', 'init.sql');
    let originalNodeEnv;

    beforeEach(async () => {
        originalNodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'test';
        sinon.restore(); // Ensure all stubs are restored from previous tests
        await closeDb(); // Ensure any existing connection is closed and dbInstance is null
        await deleteTestDbFile(); // Ensure a clean slate before each test
    });

    afterEach(async () => {
        sinon.restore(); // Clean up any sinon stubs
        await closeDb(); // Close connection
        await deleteTestDbFile(); // Delete the test database file
        process.env.NODE_ENV = originalNodeEnv; // Restore original env variable
    });

    it('should connect to the test database and initialize schema if it does not exist', async () => {
        expect(fs.existsSync(TEST_DB_PATH)).to.be.false;

        const db = await getDb();
        expect(db).to.exist;
        expect(fs.existsSync(TEST_DB_PATH)).to.be.true;

        // Verify that the 'tasks' table exists
        const tableExists = await new Promise((resolve, reject) => {
            db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='tasks'", (err, row) => {
                if (err) return reject(err);
                resolve(!!row);
            });
        });
        expect(tableExists).to.be.true;

        // Verify that the 'update_tasks_updated_at' trigger exists
        const triggerExists = await new Promise((resolve, reject) => {
            db.get("SELECT name FROM sqlite_master WHERE type='trigger' AND name='update_tasks_updated_at'", (err, row) => {
                if (err) return reject(err);
                resolve(!!row);
            });
        });
        expect(triggerExists).to.be.true;
    });

    it('should return the same database instance on subsequent calls to getDb (singleton)', async () => {
        const db1 = await getDb();
        const db2 = await getDb();
        expect(db1).to.equal(db2);
    });

    it('should connect to an existing database without re-initializing schema', async () => {
        // First call to create and initialize
        await getDb();
        await closeDb(); // Close it to simulate a fresh app start

        const consoleLogSpy = sinon.spy(console, 'log');

        // Second call should just connect
        const db = await getDb();
        expect(db).to.exist;
        expect(consoleLogSpy.calledWithMatch('Tasks table already exists. Database ready.')).to.be.true;
        expect(consoleLogSpy.calledWithMatch('Initializing schema...')).to.be.false;
        consoleLogSpy.restore();
    });

    it('should handle errors during database connection (e.g., bad path)', async () => {
        // Stub the sqlite3.Database constructor to immediately call its callback with an error.
        // This simulates a failure to open the database file due to permission issues or a bad path.
        sinon.stub(sqlite3, 'Database').callsFake(function(filename, mode, callback) {
            if (typeof mode === 'function') { // Handle optional mode argument
                callback = mode;
            }
            callback(new Error('unable to open database file: permission denied'));
            return { // Return a minimal mock object to prevent further errors from missing methods
                get: (sql, cb) => cb(new Error('DB not open')),
                all: (sql, cb) => cb(new Error('DB not open')),
                run: (sql, cb) => cb(new Error('DB not open')),
                exec: (sql, cb) => cb(new Error('DB not open')),
                close: (cb) => { if (cb) cb(); } // Synchronous close mock
            };
        });

        // Use chai-as-promised for clearer assertion of promise rejection
        await expect(getDb()).to.be.rejectedWith('unable to open database file: permission denied');
    });

    it('should handle errors when init.sql is missing during schema initialization', async () => {
        // Establish initial connection so the DB file exists, then close it.
        await getDb();
        await closeDb();
        // Ensure the dbInstance is nullified for the next getDb call to trigger schema init
        // (repeated to ensure consistency in case of specific test run order)
        let { closeDb: rawCloseDb } = require('../../config/db');
        await rawCloseDb(); 

        // Temporarily rename init.sql to simulate a missing file
        const tempInitSqlPath = INIT_SQL_PATH + '.temp';
        let renameSucceeded = false;
        try {
            fs.renameSync(INIT_SQL_PATH, tempInitSqlPath);
            renameSucceeded = true;
            const consoleErrorSpy = sinon.spy(console, 'error');

            await expect(getDb()).to.be.rejectedWith('ENOENT');
            expect(consoleErrorSpy.calledWithMatch('Error reading init.sql:')).to.be.true;
            
        } finally {
            // Restore the file even if test fails
            if (renameSucceeded && fs.existsSync(tempInitSqlPath)) {
                fs.renameSync(tempInitSqlPath, INIT_SQL_PATH); 
            }
        }
    });

    it('should handle errors during schema initialization (bad SQL)', async () => {
        // Establish initial connection, then close it to force re-initialization
        await getDb();
        await closeDb();
        // Ensure dbInstance is truly cleared
        let { closeDb: rawCloseDb } = require('../../config/db');
        await rawCloseDb(); 

        const originalFsReadFile = fs.readFile; // Keep original for restoration in stub
        sinon.stub(fs, 'readFile').callsFake((filePath, encoding, callback) => {
            if (filePath === INIT_SQL_PATH) {
                // Provide intentionally bad SQL that db.exec will choke on
                callback(null, 'CREATE TABLE tasks (id INTEGER PRIMARY KEY, title TEXT NOT NULL, completed BOOLEAN DEFAULT 0); INSERT INTO non_existent_table (col) VALUES (1);');
            } else {
                originalFsReadFile(filePath, encoding, callback); // Use original for other files
            }
        });
        const consoleErrorSpy = sinon.spy(console, 'error');

        await expect(getDb()).to.be.rejectedWith('SQLITE_ERROR: no such table: non_existent_table');
        expect(consoleErrorSpy.calledWithMatch('Error initializing database schema:')).to.be.true;
        consoleErrorSpy.restore();
    });

    it('should explicitly close the database connection', async () => {
        const db = await getDb();
        expect(db).to.exist;

        const closeSpy = sinon.spy(db, 'close');
        await closeDb();

        expect(closeSpy.calledOnce).to.be.true;
        // Subsequent getDb should create a new instance as dbInstance was nulled
        const newDb = await getDb();
        expect(newDb).to.not.equal(db); // Verify it's a new instance
    });

    it('should not throw error if closeDb is called when no connection is open', async () => {
        // Ensure no connection is open by explicitly closing before this test
        await closeDb();
        // Calling closeDb again should not throw, it should simply resolve
        await expect(closeDb()).to.be.fulfilled; // Using chai-as-promised for clarity
    });

    it('should delete the test database file', async () => {
        await getDb(); // Ensure db file exists
        expect(fs.existsSync(TEST_DB_PATH)).to.be.true;

        deleteTestDbFile();
        expect(fs.existsSync(TEST_DB_PATH)).to.be.false;
    });

    it('should do nothing if deleteTestDbFile is called when file does not exist', async () => {
        expect(fs.existsSync(TEST_DB_PATH)).to.be.false;
        deleteTestDbFile(); // Should not throw an error
        expect(fs.existsSync(TEST_DB_PATH)).to.be.false;
    });
});
