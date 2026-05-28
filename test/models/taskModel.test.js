const { expect } = require('chai');
const sinon = require('sinon');
const { getDb, closeDb, deleteTestDbFile } = require('../../config/db');
const Task = require('../../models/taskModel');

describe('Task Model', () => {
    let db;
    let originalNodeEnv;

    beforeEach(async () => {
        originalNodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'test';
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
        await closeDb(); // Close the database connection
        await deleteTestDbFile(); // Delete the test database file
        process.env.NODE_ENV = originalNodeEnv; // Restore original env variable
        sinon.restore(); // Clean up any sinon stubs
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
            try {
                await Task.create(null, 'Description');
                expect.fail('Expected Task.create to throw an error for null title');
            } catch (error) {
                expect(error.message).to.equal('Could not create task.');
            }
        });

        it('should throw an error if title is undefined', async () => {
            try {
                await Task.create(undefined, 'Description');
                expect.fail('Expected Task.create to throw an error for undefined title');
            } catch (error) {
                expect(error.message).to.equal('Could not create task.');
            }
        });

        it('should handle database errors gracefully during creation', async () => {
            // Temporarily break the `run` method of the DB
            const dbRunStub = sinon.stub(db, 'run');
            // db.run is called with (sql, params, callback). Callback is the 3rd arg (index 2).
            dbRunStub.callsArgWith(2, new Error('Simulated DB error during insert')); // Call callback with error

            try {
                await Task.create('Failing Task', 'This should fail');
                expect.fail('Expected Task.create to throw an error');
            } catch (error) {
                expect(error.message).to.equal('Could not create task.');
            } finally {
                dbRunStub.restore();
            }
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
                const createdAt1 = new Date(now.getTime() - 2000).toISOString(); // 2 seconds ago
                db.run(sql, ['First Task', '1st', 0, createdAt1, createdAt1], function(err) {
                    if (err) return reject(err);
                    resolve(this.lastID);
                });
            });

            // Insert 'Second Task'
            await new Promise((resolve, reject) => {
                const createdAt2 = new Date(now.getTime() - 1000).toISOString(); // 1 second ago
                db.run(sql, ['Second Task', '2nd', 0, createdAt2, createdAt2], function(err) {
                    if (err) return reject(err);
                    resolve(this.lastID);
                });
            });

            // Insert 'Third Task'
            await new Promise((resolve, reject) => {
                const createdAt3 = now.toISOString(); // Now
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

            try {
                await Task.findAll();
                expect.fail('Expected Task.findAll to throw an error');
            } catch (error) {
                expect(error.message).to.equal('Could not retrieve tasks.');
            } finally {
                dbAllStub.restore();
            }
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

            try {
                await Task.findById(createdTask.id);
                expect.fail('Expected Task.findById to throw an error');
            } catch (error) {
                expect(error.message).to.equal('Could not retrieve task.');
            } finally {
                dbGetStub.restore();
            }
        });
    });

    describe('Task.update', () => {
        let taskToUpdate;
        beforeEach(async () => {
            taskToUpdate = await Task.create('Old Title', 'Old Description', false);
        });

        it('should update an existing task successfully', async () => {
            // Wait for a second to ensure CURRENT_TIMESTAMP produces a different value
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const updated = await Task.update(taskToUpdate.id, 'New Title', 'New Description', true);
            expect(updated).to.be.true;

            const foundTask = await Task.findById(taskToUpdate.id);
            expect(foundTask.title).to.equal('New Title');
            expect(foundTask.description).to.equal('New Description');
            expect(foundTask.completed).to.be.true;
            // Check that updatedAt is indeed different from createdAt
            expect(foundTask.updatedAt).to.not.equal(taskToUpdate.createdAt); // Compare to original created task's createdAt
            // Optionally, check that updatedAt is later than createdAt
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
            // db.run is called with (sql, params, callback). Callback is the 3rd arg (index 2).
            dbRunStub.callsArgWith(2, new Error('Simulated DB error during update'));

            try {
                await Task.update(taskToUpdate.id, 'Failing Update', 'Desc', true);
                expect.fail('Expected Task.update to throw an error');
            } catch (error) {
                expect(error.message).to.equal('Could not update task.');
            } finally {
                dbRunStub.restore();
            }
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
            // db.run is called with (sql, params, callback). Callback is the 3rd arg (index 2).
            dbRunStub.callsArgWith(2, new Error('Simulated DB error during delete'));

            try {
                await Task.delete(taskToDelete.id);
                expect.fail('Expected Task.delete to throw an error');
            } catch (error) {
                expect(error.message).to.equal('Could not delete task.');
            } finally {
                dbRunStub.restore();
            }
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

            // Note: findAll orders by created_at DESC, so Task 2 should come first
            const tasks = await Task.findAll();
            expect(tasks).to.have.lengthOf(2);

            const task2 = tasks[0]; 
            expect(task2.id).to.be.a('number');
            expect(task2.title).to.equal('Task 2');
            expect(task2.description).to.equal('Desc 2');
            expect(task2.completed).to.be.true;
            expect(task2.createdAt).to.equal(now.toISOString());
            expect(task2.updatedAt).to.equal(now.toISOString());

            const task1 = tasks[1];
            expect(task1.id).to.be.a('number');
            expect(task1.title).to.equal('Task 1');
            expect(task1.description).to.equal('Desc 1');
            expect(task1.completed).to.be.false;
            expect(task1.createdAt).to.equal(older.toISOString());
            expect(task1.updatedAt).to.equal(older.toISOString());
        });
    });
});
