const { expect } = require('chai');
const sinon = require('sinon');
const { getDb, closeDb, deleteTestDbFile } = require('../../config/db');
const Task = require('../../models/taskModel');
const path = require('path');
const fs = require('fs');

describe('Task Model', () => {
    let db;

    beforeEach(async () => {
        // Ensure test environment
        process.env.NODE_ENV = 'test';
        // Clean up and re-initialize DB for each test suite
        await deleteTestDbFile();
        db = await getDb();
        // Seed some data if necessary for specific tests, otherwise ensure empty
        await new Promise((resolve, reject) => {
            db.exec(`DELETE FROM tasks; VACUUM;`, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    });

    afterEach(async () => {
        await closeDb();
        await deleteTestDbFile();
        delete process.env.NODE_ENV; // Clean up env variable
    });

    it('should create a new task successfully', async () => {
        const task = await Task.create('Test Task', 'This is a test description');
        expect(task).to.be.an.instanceOf(Task);
        expect(task.id).to.be.a('number');
        expect(task.title).to.equal('Test Task');
        expect(task.description).to.equal('This is a test description');
        expect(task.completed).to.be.false;

        const foundTask = await Task.findById(task.id);
        expect(foundTask.title).to.equal('Test Task');
    });

    it('should create a new task with completed status', async () => {
        const task = await Task.create('Completed Task', 'This task is done', true);
        expect(task.completed).to.be.true;

        const foundTask = await Task.findById(task.id);
        expect(foundTask.completed).to.be.true;
    });

    it('should create a task without a description', async () => {
        const task = await Task.create('Task without description', '');
        expect(task).to.be.an.instanceOf(Task);
        expect(task.description).to.equal('');
    });

    it('should reject creating a task with null title (database constraint)', async () => {
        try {
            await Task.create(null, 'Description');
            expect.fail('Expected creation to fail with null title');
        } catch (error) {
            expect(error.message).to.include('Could not create task.');
        }
    });

    it('should reject creating a task with undefined title', async () => {
        try {
            await Task.create(undefined, 'Description');
            expect.fail('Expected creation to fail with undefined title');
        } catch (error) {
            expect(error.message).to.include('Could not create task.');
        }
    });

    it('should find all tasks', async () => {
        await Task.create('Task 1', 'Desc 1');
        await Task.create('Task 2', 'Desc 2');

        const tasks = await Task.findAll();
        expect(tasks).to.be.an('array').with.lengthOf(2);
        expect(tasks[0].title).to.equal('Task 2'); // Ordered by created_at DESC
        expect(tasks[1].title).to.equal('Task 1');
    });

    it('should return an empty array if no tasks exist', async () => {
        const tasks = await Task.findAll();
        expect(tasks).to.be.an('array').with.lengthOf(0);
    });

    it('should find a task by its ID', async () => {
        const createdTask = await Task.create('Specific Task', 'Find me');
        const foundTask = await Task.findById(createdTask.id);

        expect(foundTask).to.be.an.instanceOf(Task);
        expect(foundTask.id).to.equal(createdTask.id);
        expect(foundTask.title).to.equal('Specific Task');
    });

    it('should return null if task ID not found', async () => {
        const foundTask = await Task.findById(999);
        expect(foundTask).to.be.null;
    });

    it('should return null if task ID is invalid (e.g., 0)', async () => {
        const foundTask = await Task.findById(0);
        expect(foundTask).to.be.null;
    });

    it('should update an existing task', async () => {
        const createdTask = await Task.create('Old Title', 'Old Description', false);
        const updated = await Task.update(createdTask.id, 'New Title', 'New Description', true);

        expect(updated).to.be.true;
        const foundTask = await Task.findById(createdTask.id);
        expect(foundTask.title).to.equal('New Title');
        expect(foundTask.description).to.equal('New Description');
        expect(foundTask.completed).to.be.true;
        expect(foundTask.updatedAt).to.not.equal(foundTask.createdAt); // Trigger should update this
    });

    it('should update only part of an existing task', async () => {
        const createdTask = await Task.create('Partial Update', 'Original Description', false);
        await new Promise(resolve => setTimeout(resolve, 10)); // Ensure different timestamp
        const updated = await Task.update(createdTask.id, 'Partial Update', 'New Description Only', true);

        expect(updated).to.be.true;
        const foundTask = await Task.findById(createdTask.id);
        expect(foundTask.title).to.equal('Partial Update');
        expect(foundTask.description).to.equal('New Description Only');
        expect(foundTask.completed).to.be.true;
        expect(foundTask.updatedAt).to.not.equal(createdTask.updatedAt);
    });


    it('should return false if updating a non-existent task', async () => {
        const updated = await Task.update(999, 'Non Existent', 'Desc', false);
        expect(updated).to.be.false;
    });

    it('should delete an existing task', async () => {
        const createdTask = await Task.create('Task to Delete', 'Delete me');
        const deleted = await Task.delete(createdTask.id);

        expect(deleted).to.be.true;
        const foundTask = await Task.findById(createdTask.id);
        expect(foundTask).to.be.null;
    });

    it('should return false if deleting a non-existent task', async () => {
        const deleted = await Task.delete(999);
        expect(deleted).to.be.false;
    });

    it('should return false if deleting with invalid ID (e.g., 0)', async () => {
        const deleted = await Task.delete(0);
        expect(deleted).to.be.false;
    });

    // Test error handling in model methods
    describe('Error handling in Task Model', () => {
        let dbRunStub, dbAllStub, dbGetStub;

        beforeEach(async () => {
            // Stub db methods to simulate errors
            const actualDb = await getDb(); // Get a real DB connection
            dbRunStub = sinon.stub(actualDb, 'run');
            dbAllStub = sinon.stub(actualDb, 'all');
            dbGetStub = sinon.stub(actualDb, 'get');
        });

        afterEach(async () => {
            dbRunStub.restore();
            dbAllStub.restore();
            dbGetStub.restore();
            await closeDb();
            await deleteTestDbFile();
        });

        it('should throw error when create fails', async () => {
            dbRunStub.callsArgWith(3, new Error('DB write error')); // Simulate db.run error
            try {
                await Task.create('Fail Task', 'Desc');
                expect.fail('Expected Task.create to throw an error');
            } catch (error) {
                expect(error.message).to.equal('Could not create task.');
            }
        });

        it('should throw error when findAll fails', async () => {
            dbAllStub.callsArgWith(2, new Error('DB read error')); // Simulate db.all error
            try {
                await Task.findAll();
                expect.fail('Expected Task.findAll to throw an error');
            } catch (error) {
                expect(error.message).to.equal('Could not retrieve tasks.');
            }
        });

        it('should throw error when findById fails', async () => {
            dbGetStub.callsArgWith(2, new Error('DB read error')); // Simulate db.get error
            try {
                await Task.findById(1);
                expect.fail('Expected Task.findById to throw an error');
            } catch (error) {
                expect(error.message).to.equal('Could not retrieve task.');
            }
        });

        it('should throw error when update fails', async () => {
            dbRunStub.callsArgWith(3, new Error('DB update error')); // Simulate db.run error
            try {
                await Task.update(1, 'New Title', 'New Desc', true);
                expect.fail('Expected Task.update to throw an error');
            } catch (error) {
                expect(error.message).to.equal('Could not update task.');
            }
        });

        it('should throw error when delete fails', async () => {
            dbRunStub.callsArgWith(3, new Error('DB delete error')); // Simulate db.run error
            try {
                await Task.delete(1);
                expect.fail('Expected Task.delete to throw an error');
            } catch (error) {
                expect(error.message).to.equal('Could not delete task.');
            }
        });
    });
});
