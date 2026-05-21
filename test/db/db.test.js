const { expect } = require('chai');
const sinon = require('sinon');
const fs = require('fs');
const path = require('path');
const { getDb, closeDb, deleteTestDbFile } = require('../../config/db');

describe('Database Configuration', () => {
    const TEST_DB_PATH = path.join(__dirname, '../../db', 'test_tasks.db');
    const INIT_SQL_PATH = path.join(__dirname, '../../db', 'init.sql');

    beforeEach(() => {
        process.env.NODE_ENV = 'test';
        deleteTestDbFile(); // Ensure a clean slate
    });

    afterEach(async () => {
        await closeDb(); // Close connection
        deleteTestDbFile(); // Delete the test database file
        delete process.env.NODE_ENV; // Clean up env variable
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

    it('should handle errors during database connection', async () => {
        // Temporarily rename init.sql to simulate missing file
        const tempInitSqlPath = INIT_SQL_PATH + '.temp';
        fs.renameSync(INIT_SQL_PATH, tempInitSqlPath);

        try {
            await getDb();
            expect.fail('Expected getDb to throw an error due to missing init.sql');
        } catch (error) {
            expect(error.message).to.include('Error reading init.sql');
        } finally {
            fs.renameSync(tempInitSqlPath, INIT_SQL_PATH); // Restore the file
        }
    });

    it('should handle errors during schema initialization (bad SQL)', async () => {
        const originalReadFile = fs.readFile;
        sinon.stub(fs, 'readFile').callsFake((path, encoding, callback) => {
            if (path === INIT_SQL_PATH) {
                callback(null, 'CREATE TABLE tasks (id INTEGER PRIMARY KEY, bad_column_type BLOB NOT NULL);'); // Bad SQL
            } else {
                originalReadFile(path, encoding, callback);
            }
        });

        try {
            await getDb();
            expect.fail('Expected getDb to throw an error due to bad SQL');
        } catch (error) {
            expect(error.message).to.include('Error initializing database schema');
        } finally {
            fs.readFile.restore();
        }
    });

    it('should explicitly close the database connection', async () => {
        const db = await getDb();
        expect(db).to.exist;

        const closeSpy = sinon.spy(db, 'close');
        await closeDb();

        expect(closeSpy.calledOnce).to.be.true;
        closeSpy.restore();
        // Subsequent getDb should create a new instance
        const newDb = await getDb();
        expect(newDb).to.not.equal(db);
    });

    it('should not throw error if closeDb is called when no connection is open', async () => {
        // Ensure no connection is open
        await closeDb();
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
        deleteTestDbFile(); // Should not throw
        expect(fs.existsSync(TEST_DB_PATH)).to.be.false;
    });
});
