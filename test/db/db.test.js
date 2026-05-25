const { expect } = require('chai');
const sinon = require('sinon');
const fs = require('fs');
const path = require('path');
const { getDb, closeDb, deleteTestDbFile } = require('../../config/db');

describe('Database Configuration', () => {
    const TEST_DB_PATH = path.join(__dirname, '../../db', 'test_tasks.db');
    const INIT_SQL_PATH = path.join(__dirname, '../../db', 'init.sql');
    let originalNodeEnv;

    beforeEach(() => {
        originalNodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'test';
        deleteTestDbFile(); // Ensure a clean slate before each test
    });

    afterEach(async () => {
        await closeDb(); // Close connection
        deleteTestDbFile(); // Delete the test database file
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
    });

    it('should handle errors during database connection (e.g., bad path)', async () => {
        // Temporarily modify getDbPath to return a bad path
        sinon.stub(path, 'join').callThrough();
        path.join.withArgs(__dirname, '..', 'db', sinon.match.string).returns('/nonexistent/path/test.db');

        try {
            await getDb();
            expect.fail('Expected getDb to throw an error due to bad connection path');
        } catch (error) {
            expect(error.message).to.include('unable to open database file');
        }
    });

    it('should handle errors when init.sql is missing during schema initialization', async () => {
        // Temporarily rename init.sql to simulate missing file
        const tempInitSqlPath = INIT_SQL_PATH + '.temp';
        fs.renameSync(INIT_SQL_PATH, tempInitSqlPath);

        try {
            await getDb();
            expect.fail('Expected getDb to throw an error due to missing init.sql');
        } catch (error) {
            expect(error.message).to.include('Error reading init.sql');
            expect(error.message).to.include('ENOENT'); // File not found error code
        } finally {
            fs.renameSync(tempInitSqlPath, INIT_SQL_PATH); // Restore the file
        }
    });

    it('should handle errors during schema initialization (bad SQL)', async () => {
        // Stub fs.readFile to return malformed SQL for init.sql
        sinon.stub(fs, 'readFile').callsFake((filePath, encoding, callback) => {
            if (filePath === INIT_SQL_PATH) {
                // Provide intentionally bad SQL
                callback(null, 'CREATE TABLE tasks (id INTEGER PRIMARY KEY, title TEXT NOT NULL, completed BOOLEAN DEFAULT 0, created_at DATETIME, updated_at DATETIME); INSERT INTO bad_table (col) VALUES (1);');
            } else {
                // Call original function for other files
                sinon.wrappedMethod.apply(fs, [filePath, encoding, callback]);
            }
        });

        try {
            await getDb();
            expect.fail('Expected getDb to throw an error due to bad SQL');
        } catch (error) {
            expect(error.message).to.include('Error initializing database schema');
            expect(error.message).to.include('no such table: bad_table');
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
        // Calling closeDb again should not throw
        await expect(closeDb()).to.not.be.rejected;
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
