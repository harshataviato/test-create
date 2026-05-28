const { expect } = require('chai');
const sinon = require('sinon');
const fs = require('fs');
const path = require('path');
const { getDb, closeDb, deleteTestDbFile } = require('../../config/db');
const sqlite3 = require('sqlite3'); // Import sqlite3 to stub its Database constructor

describe('Database Configuration', () => {
    const TEST_DB_PATH = path.join(__dirname, '../../db', 'test_tasks.db');
    const INIT_SQL_PATH = path.join(__dirname, '../../db', 'init.sql');
    let originalNodeEnv;
    let sqlite3DatabaseStub; // Declare stub variable outside to manage it

    beforeEach(async () => {
        originalNodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'test';
        await deleteTestDbFile(); // Ensure a clean slate before each test
        // Restore sqlite3.Database stub if it was applied in a previous test
        if (sqlite3DatabaseStub && sqlite3DatabaseStub.restore) {
            sqlite3DatabaseStub.restore();
        }
    });

    afterEach(async () => {
        await closeDb(); // Close connection
        await deleteTestDbFile(); // Delete the test database file
        process.env.NODE_ENV = originalNodeEnv; // Restore original env variable
        sinon.restore(); // Clean up any stubs
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
        // Temporarily stub sqlite3.Database constructor to simulate connection error
        sqlite3DatabaseStub = sinon.stub(sqlite3, 'Database').callsFake((filename, mode, callback) => {
            // Immediately call callback with an error, simulating a failure to open db file
            process.nextTick(() => {
                if (callback) callback(new Error('unable to open database file: /nonexistent/path/test.db'));
            });
            // Return a mock object with a .close method to prevent further errors
            return { close: (cb) => process.nextTick(() => cb()) };
        });

        try {
            await getDb();
            expect.fail('Expected getDb to throw an error due to bad connection path');
        } catch (error) {
            expect(error.message).to.include('unable to open database file'); // Assert against the mocked error
        }
    });

    it('should handle errors when init.sql is missing during schema initialization', async () => {
        // Ensure db file is actually created so it attempts to read init.sql
        await getDb(); // Create and connect
        await closeDb(); // Close connection to allow next getDb call to re-init, which will try to read init.sql

        // Temporarily rename init.sql to simulate missing file
        const tempInitSqlPath = INIT_SQL_PATH + '.temp';
        fs.renameSync(INIT_SQL_PATH, tempInitSqlPath);

        try {
            await getDb();
            expect.fail('Expected getDb to throw an error due to missing init.sql');
        } catch (error) {
            // The error propagated from fs.readFile is 'ENOENT: no such file or directory'
            expect(error.message).to.include('ENOENT'); // Only check for ENOENT, as the full message can vary
        } finally {
            fs.renameSync(tempInitSqlPath, INIT_SQL_PATH); // Restore the file
        }
    });

    it('should handle errors during schema initialization (bad SQL)', async () => {
        // First ensure DB is setup, then close it for next `getDb` call to re-init
        await getDb();
        await closeDb();
        await deleteTestDbFile(); // delete so it will re-initialize

        const originalReadFile = fs.readFile; // Keep reference to original fs.readFile
        sinon.stub(fs, 'readFile').callsFake((filePath, encoding, callback) => {
            if (filePath === INIT_SQL_PATH) {
                // Provide intentionally bad SQL that db.exec will choke on
                callback(null, 'CREATE TABLE bad_table_syntax (id INTEGER PRIMARY KEY, title TEXT NOT NULL); INSERT INTO non_existent_table (col) VALUES (1);');
            } else {
                originalReadFile(filePath, encoding, callback); // Use original for other files
            }
        });

        try {
            await getDb();
            expect.fail('Expected getDb to throw an error due to bad SQL');
        } catch (error) {
            // The error propagated from db.exec will be SQLITE_ERROR
            expect(error.message).to.include('SQLITE_ERROR');
            expect(error.message).to.include('no such table: non_existent_table');
        }
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
        // Ensure no connection is open by closing it first if it was
        await closeDb();
        // Calling closeDb again should not throw, simply resolve
        await closeDb(); 
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
