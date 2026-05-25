const request = require('supertest');
const { expect } = require('chai');
const sinon = require('sinon');
const app = require('../../app');
const Task = require('../../models/taskModel');
const { getDb, closeDb, deleteTestDbFile } = require('../../config/db');

describe('Application Integration Tests', () => {
    let agent;
    let originalNodeEnv;

    beforeEach(async () => {
        originalNodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'test';
        await deleteTestDbFile();
        await getDb(); // Ensure DB is initialized for testing
        // Clear tasks table for a clean state in each test
        const db = await getDb();
        await new Promise((resolve, reject) => {
            db.exec('DELETE FROM tasks; VACUUM;', (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
        agent = request.agent(app); // Use agent to maintain cookies/sessions if needed
    });

    afterEach(async () => {
        await closeDb();
        await deleteTestDbFile();
        process.env.NODE_ENV = originalNodeEnv; // Restore original env variable
        sinon.restore(); // Clean up any stubs
    });

    describe('GET /', () => {
        it('should render the home page successfully', async () => {
            const res = await agent.get('/');
            expect(res.statusCode).to.equal(200);
            expect(res.text).to.include('<h1>Task Management App</h1>');
            expect(res.text).to.include('<h2>Welcome to the Task Management Application!</h2>');
            expect(res.text).to.include('<a href="/tasks">View All Tasks</a>');
            expect(res.text).to.include('<a href="/tasks/new">Add New Task</a>');
        });
    });

    describe('GET /tasks', () => {
        it('should render the tasks index page with existing tasks', async () => {
            await Task.create('Task A', 'Description for Task A');
            await Task.create('Task B', 'Description for Task B', true); // Completed task

            const res = await agent.get('/tasks');
            expect(res.statusCode).to.equal(200);
            expect(res.text).to.include('<h2>All Tasks</h2>');
            expect(res.text).to.include('Task A');
            expect(res.text).to.include('Description for Task A');
            expect(res.text).to.include('Task B');
            expect(res.text).to.include('Description for Task B');
            expect(res.text).to.include('task-item completed'); // Check for class for completed task
        });

        it('should render the tasks index page when no tasks exist', async () => {
            const res = await agent.get('/tasks');
            expect(res.statusCode).to.equal(200);
            expect(res.text).to.include('<h2>All Tasks</h2>');
            expect(res.text).to.include('No tasks found. Why not <a href="/tasks/new">add a new one</a>?');
        });

        it('should handle database errors when fetching tasks gracefully', async () => {
            // Stub Task.findAll to throw an error
            const findAllStub = sinon.stub(Task, 'findAll').throws(new Error('Simulated DB read error'));
            const res = await agent.get('/tasks');
            expect(res.statusCode).to.equal(500);
            expect(res.text).to.include('Something went wrong!');
            expect(res.text).to.include('Failed to load tasks.');
            expect(res.text).to.not.include('Simulated DB read error'); // Error detail should not be exposed in test env
            findAllStub.restore();
        });
    });

    describe('GET /tasks/new', () => {
        it('should render the new task form successfully', async () => {
            const res = await agent.get('/tasks/new');
            expect(res.statusCode).to.equal(200);
            expect(res.text).to.include('<h2>Create New Task</h2>');
            expect(res.text).to.include('<form action="/tasks" method="POST">');
            expect(res.text).to.include('<input type="text" id="title" name="title" value="" required>');
            expect(res.text).to.include('<textarea id="description" name="description" rows="5"></textarea>');
        });
    });

    describe('POST /tasks', () => {
        it('should successfully create a new task and redirect', async () => {
            const res = await agent.post('/tasks')
                .send({ title: 'New Task Title', description: 'New Task Description' })
                .expect(302);
            expect(res.header.location).to.equal('/tasks');

            const tasksInDb = await Task.findAll();
            expect(tasksInDb).to.have.lengthOf(1);
            expect(tasksInDb[0].title).to.equal('New Task Title');
            expect(tasksInDb[0].description).to.equal('New Task Description');
            expect(tasksInDb[0].completed).to.be.false;
        });

        it('should create a task with an empty description', async () => {
            const res = await agent.post('/tasks')
                .send({ title: 'Task with No Desc', description: '' })
                .expect(302);
            expect(res.header.location).to.equal('/tasks');

            const tasksInDb = await Task.findAll();
            expect(tasksInDb).to.have.lengthOf(1);
            expect(tasksInDb[0].title).to.equal('Task with No Desc');
            expect(tasksInDb[0].description).to.equal('');
        });

        it('should return 400 and render form with error if title is missing', async () => {
            const res = await agent.post('/tasks')
                .send({ title: '', description: 'Some Description' })
                .expect(400);
            expect(res.text).to.include('Title is required and cannot be empty.');
            expect(res.text).to.include('<h2>Create New Task</h2>'); // Still renders the form
            expect(res.text).to.include('value=""'); // Title input should be empty
            expect(res.text).to.include('>Some Description</textarea>'); // Description should be pre-filled
        });

        it('should return 400 and render form with error if title is whitespace', async () => {
            const res = await agent.post('/tasks')
                .send({ title: '   ', description: 'Some Description' })
                .expect(400);
            expect(res.text).to.include('Title is required and cannot be empty.');
            expect(res.text).to.include('value="   "'); // Should retain the whitespace
        });

        it('should handle database errors when creating a task gracefully', async () => {
            // Stub Task.create to throw an error
            const createStub = sinon.stub(Task, 'create').throws(new Error('Simulated DB write error'));
            const res = await agent.post('/tasks')
                .send({ title: 'Task to Fail', description: 'Description to fail' })
                .expect(500);
            expect(res.text).to.include('Failed to create task.');
            expect(res.text).to.include('<h2>Create New Task</h2>'); // Still renders the form
            expect(res.text).to.include('value="Task to Fail"'); // Pre-fills title
            expect(res.text).to.include('>Description to fail</textarea>'); // Pre-fills description
            expect(res.text).to.not.include('Simulated DB write error');
            createStub.restore();
        });
    });

    describe('GET /tasks/:id/edit', () => {
        let taskToEdit;
        beforeEach(async () => {
            taskToEdit = await Task.create('Task for Edit', 'Description for edit', false);
        });

        it('should render the edit task form for an existing task', async () => {
            const res = await agent.get(`/tasks/${taskToEdit.id}/edit`);
            expect(res.statusCode).to.equal(200);
            expect(res.text).to.include(`<h2>Edit Task: ${taskToEdit.title}</h2>`);
            expect(res.text).to.include(`<input type="text" id="title" name="title" value="${taskToEdit.title}" required>`);
            expect(res.text).to.include(`<textarea id="description" name="description" rows="5">${taskToEdit.description}</textarea>`);
            expect(res.text).to.not.include('checked'); // Not completed
        });

        it('should render edit form correctly for a completed task', async () => {
            const completedTask = await Task.create('Completed Task', 'Done', true);
            const res = await agent.get(`/tasks/${completedTask.id}/edit`);
            expect(res.statusCode).to.equal(200);
            expect(res.text).to.include('checked'); // Should be checked
        });

        it('should return 404 for a non-existent task ID', async () => {
            const res = await agent.get('/tasks/99999/edit'); // Non-existent ID
            expect(res.statusCode).to.equal(404);
            expect(res.text).to.include('Task Not Found');
            expect(res.text).to.include('Task with ID 99999 not found.');
        });

        it('should return 400 for an invalid task ID (non-numeric)', async () => {
            const res = await agent.get('/tasks/abc/edit');
            expect(res.statusCode).to.equal(400);
            expect(res.text).to.include('Invalid Task ID provided.');
        });

        it('should return 400 for an invalid task ID (negative)', async () => {
            const res = await agent.get('/tasks/-1/edit');
            expect(res.statusCode).to.equal(400);
            expect(res.text).to.include('Invalid Task ID provided.');
        });

        it('should handle database errors when fetching task for edit gracefully', async () => {
            // Stub Task.findById to throw an error
            const findByIdStub = sinon.stub(Task, 'findById').throws(new Error('Simulated DB read error'));
            const res = await agent.get(`/tasks/${taskToEdit.id}/edit`);
            expect(res.statusCode).to.equal(500);
            expect(res.text).to.include('Failed to load task for editing.');
            expect(res.text).to.not.include('Simulated DB read error');
            findByIdStub.restore();
        });
    });

    describe('PUT /tasks/:id', () => {
        let taskToUpdate;
        beforeEach(async () => {
            taskToUpdate = await Task.create('Original Title', 'Original Description', false);
        });

        it('should successfully update an existing task and redirect', async () => {
            const res = await agent.put(`/tasks/${taskToUpdate.id}?_method=PUT`)
                .send({ title: 'Updated Title', description: 'Updated Description', completed: 'on' })
                .expect(302);
            expect(res.header.location).to.equal('/tasks');

            const updatedTask = await Task.findById(taskToUpdate.id);
            expect(updatedTask.title).to.equal('Updated Title');
            expect(updatedTask.description).to.equal('Updated Description');
            expect(updatedTask.completed).to.be.true;
        });

        it('should update a task to incomplete status', async () => {
            const completedTask = await Task.create('Task to uncomplete', 'Mark me done first', true);
            const res = await agent.put(`/tasks/${completedTask.id}?_method=PUT`)
                .send({ title: 'Uncompleted Task', description: 'Now un-done', completed: 'off' }) // 'off' or simply not present for checkbox
                .expect(302);
            expect(res.header.location).to.equal('/tasks');

            const updatedTask = await Task.findById(completedTask.id);
            expect(updatedTask.title).to.equal('Uncompleted Task');
            expect(updatedTask.completed).to.be.false;
        });

        it('should update a task with an empty description', async () => {
            const res = await agent.put(`/tasks/${taskToUpdate.id}?_method=PUT`)
                .send({ title: 'Title with Empty Desc', description: '', completed: 'off' })
                .expect(302);
            expect(res.header.location).to.equal('/tasks');

            const updatedTask = await Task.findById(taskToUpdate.id);
            expect(updatedTask.title).to.equal('Title with Empty Desc');
            expect(updatedTask.description).to.equal('');
        });

        it('should return 404 for updating a non-existent task ID', async () => {
            const res = await agent.put('/tasks/99999?_method=PUT')
                .send({ title: 'Non Existent', description: 'Desc', completed: 'on' })
                .expect(404);
            expect(res.text).to.include('Task Not Found');
            expect(res.text).to.include('Task with ID 99999 not found for update.');
        });

        it('should return 400 and render form with error if title is missing during update', async () => {
            const res = await agent.put(`/tasks/${taskToUpdate.id}?_method=PUT`)
                .send({ title: '', description: 'Description kept', completed: 'on' })
                .expect(400);
            expect(res.text).to.include('Title is required and cannot be empty.');
            expect(res.text).to.include(`<h2>Edit Task: ${taskToUpdate.title}</h2>`); // Renders edit form
            expect(res.text).to.include('value=""'); // Title input should be empty
            expect(res.text).to.include('>Description kept</textarea>'); // Description should be pre-filled
            expect(res.text).to.include('checked'); // Completed should be checked
        });

        it('should return 400 and render form with error if title is whitespace during update', async () => {
            const res = await agent.put(`/tasks/${taskToUpdate.id}?_method=PUT`)
                .send({ title: '  ', description: 'Description kept', completed: 'off' })
                .expect(400);
            expect(res.text).to.include('Title is required and cannot be empty.');
            expect(res.text).to.include('value="  "'); // Retain whitespace
            expect(res.text).to.not.include('checked'); // Completed should not be checked
        });

        it('should return 400 for an invalid task ID (non-numeric) during update', async () => {
            const res = await agent.put('/tasks/xyz?_method=PUT')
                .send({ title: 'Valid Title', description: 'Valid Desc', completed: 'off' })
                .expect(400);
            expect(res.text).to.include('Invalid Task ID provided for update.');
        });

        it('should handle database errors when updating a task gracefully', async () => {
            // Stub Task.update to throw an error
            const updateStub = sinon.stub(Task, 'update').throws(new Error('Simulated DB update error'));
            const res = await agent.put(`/tasks/${taskToUpdate.id}?_method=PUT`)
                .send({ title: 'Title to Fail Update', description: 'Desc to Fail Update', completed: 'on' })
                .expect(500);
            expect(res.text).to.include('Failed to update task.');
            expect(res.text).to.include('<h2>Edit Task: Title to Fail Update</h2>'); // Renders edit form
            expect(res.text).to.include('value="Title to Fail Update"'); // Pre-fills title
            expect(res.text).to.include('>Desc to Fail Update</textarea>'); // Pre-fills description
            expect(res.text).to.include('checked'); // Pre-fills completed status
            expect(res.text).to.not.include('Simulated DB update error');
            updateStub.restore();
        });
    });

    describe('DELETE /tasks/:id', () => {
        let taskToDelete;
        beforeEach(async () => {
            taskToDelete = await Task.create('Task for Delete', 'Description for delete');
        });

        it('should successfully delete an existing task and redirect', async () => {
            const res = await agent.post(`/tasks/${taskToDelete.id}?_method=DELETE`)
                .expect(302);
            expect(res.header.location).to.equal('/tasks');

            const deletedTask = await Task.findById(taskToDelete.id);
            expect(deletedTask).to.be.null; // Task should no longer exist
        });

        it('should return 404 for deleting a non-existent task ID', async () => {
            const res = await agent.post('/tasks/99999?_method=DELETE')
                .expect(404);
            expect(res.text).to.include('Task Not Found');
            expect(res.text).to.include('Task with ID 99999 not found for deletion.');
        });

        it('should return 400 for an invalid task ID (non-numeric) for deletion', async () => {
            const res = await agent.post('/tasks/xyz?_method=DELETE')
                .expect(400);
            expect(res.text).to.include('Invalid Task ID provided for deletion.');
        });

        it('should handle database errors when deleting a task gracefully', async () => {
            // Stub Task.delete to throw an error
            const deleteStub = sinon.stub(Task, 'delete').throws(new Error('Simulated DB delete error'));
            const res = await agent.post(`/tasks/${taskToDelete.id}?_method=DELETE`)
                .expect(500);
            expect(res.text).to.include('Failed to delete task.');
            expect(res.text).to.not.include('Simulated DB delete error');
            deleteStub.restore();
        });
    });

    describe('Error Handling Middleware (app.js)', () => {
        it('should catch errors thrown in routes and render generic error page for production/test env', async () => {
            // This test is already effectively covered by the controller error handling tests above,
            // but we can add a specific route to explicitly test the app-wide error handler.
            app.get('/test-error', (req, res, next) => {
                next(new Error('Intentional Test Error'));
            });

            const res = await agent.get('/test-error');
            expect(res.statusCode).to.equal(500);
            expect(res.text).to.include('Something went wrong!');
            expect(res.text).to.include('Error'); // Title
            expect(res.text).to.include('Please try again later or contact support if the issue persists.');
            expect(res.text).to.not.include('Intentional Test Error'); // Specific error message should not be visible in test environment

            // Cleanup the added route by removing it from the router stack
            // (Note: This is a bit hacky for testing. In a real app, define test-specific routes outside main app.js)
            const routeIndex = app._router.stack.findIndex(layer => layer.route && layer.route.path === '/test-error');
            if (routeIndex > -1) {
                app._router.stack.splice(routeIndex, 1);
            }
        });
    });
});
