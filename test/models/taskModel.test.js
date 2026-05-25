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
            dbRunStub.callsArgWith(3, new Error('Simulated DB error during insert')); // Call callback with error

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
            await Task.create('First Task', '1st');
            await new Promise(resolve => setTimeout(resolve, 10)); // Ensure different timestamps
            await Task.create('Second Task', '2nd');
            await new Promise(resolve => setTimeout(resolve, 10));
            await Task.create('Third Task', '3rd');

            const tasks = await Task.findAll();
            expect(tasks).to.be.an('array').with.lengthOf(3);
            expect(tasks[0].title).to.equal('Third Task');
            expect(tasks[1].title).to.equal('Second Task');
            expect(tasks[2].title).to.equal('First Task');
            tasks.forEach(task => {
                expect(task).to.be.an.instanceOf(Task);
                expect(task.createdAt).to.exist;
                expect(task.updatedAt).to.exist;
            });
        });

        it('should handle database errors gracefully when finding all tasks', async () => {
            // Temporarily break the `all` method of the DB
            const dbAllStub = sinon.stub(db, 'all');
            dbAllStub.callsArgWith(2, new Error('Simulated DB error during select all'));

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
            dbGetStub.callsArgWith(2, new Error('Simulated DB error during select by ID'));

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
            const updated = await Task.update(taskToUpdate.id, 'New Title', 'New Description', true);
            expect(updated).to.be.true;

            const foundTask = await Task.findById(taskToUpdate.id);
            expect(foundTask.title).to.equal('New Title');
            expect(foundTask.description).to.equal('New Description');
            expect(foundTask.completed).to.be.true;
            expect(foundTask.updatedAt).to.not.equal(foundTask.createdAt); // Verify trigger worked
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
            dbRunStub.callsArgWith(3, new Error('Simulated DB error during update'));

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
            dbRunStub.callsArgWith(3, new Error('Simulated DB error during delete'));

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
            const sql = `INSERT INTO tasks (title, description, completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`;
            const now = new Date().toISOString();
            const older = new Date(Date.now() - 3600000).toISOString(); // 1 hour ago

            await new Promise((resolve, reject) => {
                db.run(sql, ['Task 1', 'Desc 1', 0, older, older], function (err) {
                    if (err) return reject(err);
                    resolve();
                });
            });
            await new Promise((resolve, reject) => {
                db.run(sql, ['Task 2', 'Desc 2', 1, now, now], function (err) {
                    if (err) return reject(err);
                    resolve();
                });
            });

            const tasks = await Task.findAll();
            expect(tasks).to.have.lengthOf(2);

            const task2 = tasks[0]; // Task 2 is newer
            expect(task2.id).to.be.a('number');
            expect(task2.title).to.equal('Task 2');
            expect(task2.description).to.equal('Desc 2');
            expect(task2.completed).to.be.true;
            expect(task2.createdAt).to.equal(now);
            expect(task2.updatedAt).to.equal(now);

            const task1 = tasks[1];
            expect(task1.id).to.be.a('number');
            expect(task1.title).to.equal('Task 1');
            expect(task1.description).to.equal('Desc 1');
            expect(task1.completed).to.be.false;
            expect(task1.createdAt).to.equal(older);
            expect(task1.updatedAt).to.equal(older);
        });
    });
});
