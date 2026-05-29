const { expect } = require('chai');
const sinon = require('sinon');
const { getDb, closeDb, deleteTestDbFile } = require('../../config/db');
const Task = require('../../models/taskModel');
const sqlite3 = require('sqlite3'); // For direct DB access in tests
const fs = require('fs'); // For stubbing in db.test.js, declared here for consistency


const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

describe('Task Model', () => {
    let db;
    let originalNodeEnv;

    beforeEach(async () => {
        originalNodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'test';
        sinon.restore(); // Clean up any previous stubs
        await closeDb(); // Ensure a clean database state
        await deleteTestDbFile(); // Ensure a clean test database file
        db = await getDb(); // Get a fresh database connection
        // Clear all tasks for isolated test execution
        await new Promise((resolve, reject) => {
            db.exec(`DELETE FROM tasks; VACUUM;`, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    });

    afterEach(async () => {
        sinon.restore(); // Clean up any sinon stubs
        await closeDb(); // Close the database connection
        await deleteTestDbFile(); // Delete the test database file
        process.env.NODE_ENV = originalNodeEnv; // Restore original env variable
    });

    describe('Task.create', () => {
        it('should create a new task successfully with default completed status', async () => {
            const task = await Task.create('New Task', 'Description for new task');
            expect(task).to.be.an.instanceOf(Task);
            expect(task.id).to.be.a('number').and.to.be.above(0);
            expect(task.title).to.equal('New Task');
            expect(task.description).to.equal('Description for new task');
            expect(task.completed).to.be.false;

            const foundTask = await Task.findById(task.id);
            expect(foundTask.title).to.equal('New Task');
            expect(foundTask.completed).to.be.false;
        });

        it('should create a new task with specified completed status (true)', async () => {
            const task = await Task.create('Completed Task', 'This task is already done', true);
            expect(task.completed).to.be.true;

            const foundTask = await Task.findById(task.id);
            expect(foundTask.completed).to.be.true;
        });

        it('should create a new task with specified completed status (false)', async () => {
            const task = await Task.create('Incomplete Task', 'This task is not done', false);
            expect(task.completed).to.be.false;

            const foundTask = await Task.findById(task.id);
            expect(foundTask.completed).to.be.false;
        });

        it('should create a task without a description (empty string)', async () => {
            const task = await Task.create('Task without description', '');
            expect(task).to.be.an.instanceOf(Task);
            expect(task.description).to.equal('');
        });

        it('should throw an error if title is null', async () => {
            await expect(Task.create(null, 'Description')).to.be.rejectedWith('Could not create task.');
        });

        it('should throw an error if title is undefined', async () => {
            await expect(Task.create(undefined, 'Description')).to.be.rejectedWith('Could not create task.');
        });

        it('should handle database errors gracefully during creation', async () => {
            const dbRunStub = sinon.stub(db, 'run');
            // Use .yields() which is more robust for callback errors regardless of argument count variations
            dbRunStub.yields(new Error('Simulated DB error during insert')); 

            await expect(Task.create('Failing Task', 'This should fail')).to.be.rejectedWith('Could not create task.');
            dbRunStub.restore();
        });
    });

    describe('Task.findAll', () => {
        it('should return an empty array if no tasks exist', async () => {
            const tasks = await Task.findAll();
            expect(tasks).to.be.an('array').with.lengthOf(0);
        });

        it('should return all existing tasks, ordered by creation date descending', async () => {
            // Manually insert tasks with distinct created_at for predictable ordering
            const now = new Date();
            const sql = `INSERT INTO tasks (title, description, completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`;

            // Insert 'First Task'
            await new Promise((resolve, reject) => {
                const createdAt1 = new Date(now.getTime() - 3000).toISOString(); // 3 seconds ago
                db.run(sql, ['First Task', '1st', 0, createdAt1, createdAt1], function(err) {
                    if (err) return reject(err);
                    resolve(this.lastID);
                });
            });

            // Insert 'Second Task'
            await new Promise((resolve, reject) => {
                const createdAt2 = new Date(now.getTime() - 2000).toISOString(); // 2 seconds ago
                db.run(sql, ['Second Task', '2nd', 0, createdAt2, createdAt2], function(err) {
                    if (err) return reject(err);
                    resolve(this.lastID);
                });
            });

            // Insert 'Third Task'
            await new Promise((resolve, reject) => {
                const createdAt3 = new Date(now.getTime() - 1000).toISOString(); // 1 second ago
                db.run(sql, ['Third Task', '3rd', 0, createdAt3, createdAt3], function(err) {
                    if (err) return reject(err);
                    resolve(this.lastID);
                });
            });

            const tasks = await Task.findAll();
            expect(tasks).to.be.an('array').with.lengthOf(3);
            expect(tasks[0].title).to.equal('Third Task'); // Newest should be first
            expect(tasks[1].title).to.equal('Second Task');
            expect(tasks[2].title).to.equal('First Task'); // Oldest should be last
            tasks.forEach(task => {
                expect(task).to.be.an.instanceOf(Task);
                expect(task.createdAt).to.exist;
                expect(task.updatedAt).to.exist;
            });
        });

        it('should handle database errors gracefully when finding all tasks', async () => {
            // Temporarily break the `all` method of the DB
            const dbAllStub = sinon.stub(db, 'all');
            dbAllStub.callsArgWith(2, new Error('Simulated DB error during select all')); // Callback is 3rd arg (index 2)

            await expect(Task.findAll()).to.be.rejectedWith('Could not retrieve tasks.');
            dbAllStub.restore();
        });
    });

    describe('Task.findById', () => {
        let createdTask;
        beforeEach(async () => {
            createdTask = await Task.create('Specific Task', 'Find me by ID');
        });

        it('should find a task by its ID', async () => {
            const foundTask = await Task.findById(createdTask.id);
            expect(foundTask).to.be.an.instanceOf(Task);
            expect(foundTask.id).to.equal(createdTask.id);
            expect(foundTask.title).to.equal('Specific Task');
            expect(foundTask.description).to.equal('Find me by ID');
            expect(foundTask.completed).to.be.false;
        });

        it('should return null if task ID is not found', async () => {
            const foundTask = await Task.findById(99999); // Non-existent ID
            expect(foundTask).to.be.null;
        });

        it('should return null for invalid task ID (e.g., 0)', async () => {
            const foundTask = await Task.findById(0);
            expect(foundTask).to.be.null;
        });

        it('should return null for invalid task ID (e.g., negative)', async () => {
            const foundTask = await Task.findById(-1);
            expect(foundTask).to.be.null;
        });

        it('should handle database errors gracefully when finding by ID', async () => {
            // Temporarily break the `get` method of the DB
            const dbGetStub = sinon.stub(db, 'get');
            dbGetStub.callsArgWith(2, new Error('Simulated DB error during select by ID')); // Callback is 3rd arg (index 2)

            await expect(Task.findById(createdTask.id)).to.be.rejectedWith('Could not retrieve task.');
            dbGetStub.restore();
        });
    });

    describe('Task.update', () => {
        let taskToUpdate;
        beforeEach(async () => {
            // Manually insert the task with a predefined old timestamp to ensure updatedAt changes.
            const oldTimestamp = new Date(Date.now() - 60000).toISOString(); // 1 minute ago
            const sql = `INSERT INTO tasks (title, description, completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`;
            const lastID = await new Promise((resolve, reject) => {
                db.run(sql, ['Old Title', 'Old Description', 0, oldTimestamp, oldTimestamp], function(err) {
                    if (err) return reject(err);
                    resolve(this.lastID);
                });
            });
            taskToUpdate = await Task.findById(lastID);
        });

        it('should update an existing task successfully', async () => {
            // Wait for a short period to ensure CURRENT_TIMESTAMP generates a different value upon update
            await new Promise(resolve => setTimeout(resolve, 50)); 
            
            const updated = await Task.update(taskToUpdate.id, 'New Title', 'New Description', true);
            expect(updated).to.be.true;

            const foundTask = await Task.findById(taskToUpdate.id);
            expect(foundTask.title).to.equal('New Title');
            expect(foundTask.description).to.equal('New Description');
            expect(foundTask.completed).to.be.true;
            // Ensure updatedAt is a later timestamp than createdAt
            expect(new Date(foundTask.updatedAt).getTime()).to.be.greaterThan(new Date(taskToUpdate.createdAt).getTime());
        });

        it('should update only the completed status of an existing task', async () => {
            const updated = await Task.update(taskToUpdate.id, taskToUpdate.title, taskToUpdate.description, true);
            expect(updated).to.be.true;

            const foundTask = await Task.findById(taskToUpdate.id);
            expect(foundTask.title).to.equal(taskToUpdate.title);
            expect(foundTask.description).to.equal(taskToUpdate.description);
            expect(foundTask.completed).to.be.true;
        });

        it('should return false if updating a non-existent task', async () => {
            const updated = await Task.update(99999, 'Non Existent', 'Desc', false);
            expect(updated).to.be.false;
        });

        it('should return false if updating with invalid ID (e.g., 0)', async () => {
            const updated = await Task.update(0, 'Non Existent', 'Desc', false);
            expect(updated).to.be.false;
        });

        it('should handle database errors gracefully during update', async () => {
            // Temporarily break the `run` method of the DB
            const dbRunStub = sinon.stub(db, 'run');
            dbRunStub.yields(new Error('Simulated DB error during update'));

            await expect(Task.update(taskToUpdate.id, 'Failing Update', 'Desc', true)).to.be.rejectedWith('Could not update task.');
            dbRunStub.restore();
        });
    });

    describe('Task.delete', () => {
        let taskToDelete;
        beforeEach(async () => {
            taskToDelete = await Task.create('Task to Delete', 'Delete me');
        });

        it('should delete an existing task successfully', async () => {
            const deleted = await Task.delete(taskToDelete.id);
            expect(deleted).to.be.true;

            const foundTask = await Task.findById(taskToDelete.id);
            expect(foundTask).to.be.null; // Task should no longer exist
        });

        it('should return false if deleting a non-existent task', async () => {
            const deleted = await Task.delete(99999); // Non-existent ID
            expect(deleted).to.be.false;
        });

        it('should return false if deleting with invalid ID (e.g., 0)', async () => {
            const deleted = await Task.delete(0);
            expect(deleted).to.be.false;
        });

        it('should handle database errors gracefully during deletion', async () => {
            // Temporarily break the `run` method of the DB
            const dbRunStub = sinon.stub(db, 'run');
            dbRunStub.yields(new Error('Simulated DB error during delete'));

            await expect(Task.delete(taskToDelete.id)).to.be.rejectedWith('Could not delete task.');
            dbRunStub.restore();
        });
    });

    describe('Task Model properties and methods', () => {
        it('should correctly map database rows to Task objects', async () => {
            const sql = `INSERT INTO tasks (id, title, description, completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`;
            const now = new Date();
            const older = new Date(now.getTime() - 3600000); // 1 hour ago

            await new Promise((resolve, reject) => {
                db.run(sql, [1, 'Task 1', 'Desc 1', 0, older.toISOString(), older.toISOString()], function (err) {
                    if (err) return reject(err);
                    resolve();
                });
            });
            await new Promise((resolve, reject) => {
                db.run(sql, [2, 'Task 2', 'Desc 2', 1, now.toISOString(), now.toISOString()], function (err) {
                    if (err) return reject(err);
                    resolve();
                });
            });

            const tasks = await Task.findAll();
            expect(tasks).to.have.lengthOf(2);

            // Note: findAll orders by created_at DESC, so Task 2 should come first
            const taskRecent = tasks[0]; 
            const taskOlder = tasks[1];

            expect(taskRecent.id).to.be.a('number');
            expect(taskRecent.title).to.equal('Task 2');
            expect(taskRecent.description).to.equal('Desc 2');
            expect(taskRecent.completed).to.be.true;
            expect(taskRecent.createdAt).to.equal(now.toISOString());
            expect(taskRecent.updatedAt).to.equal(now.toISOString());

            expect(taskOlder.id).to.be.a('number');
            expect(taskOlder.title).to.equal('Task 1');
            expect(taskOlder.description).to.equal('Desc 1');
            expect(taskOlder.completed).to.be.false;
            expect(taskOlder.createdAt).to.equal(older.toISOString());
            expect(taskOlder.updatedAt).to.equal(older.toISOString());
        });
    });
});
