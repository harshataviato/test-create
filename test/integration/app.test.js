const request = require('supertest');
const { expect } = require('chai');
const sinon = require('sinon');
const app = require('../../app');
const Task = require('../../models/taskModel');
const { getDb, closeDb, deleteTestDbFile } = require('../../config/db');

describe('Application Integration Tests', () => {
    let agent;

    beforeEach(async () => {
        process.env.NODE_ENV = 'test';
        await deleteTestDbFile();
        await getDb(); // Ensure DB is initialized
        await new Promise((resolve, reject) => {
            getDb().then(db => db.exec('DELETE FROM tasks; VACUUM;', (err) => {
                if (err) return reject(err);
                resolve();
            }));
        });
        agent = request.agent(app); // Use agent to maintain cookies/sessions
    });

    afterEach(async () => {
        await closeDb();
        await deleteTestDbFile();
        delete process.env.NODE_ENV;
        sinon.restore(); // Clean up any stubs
    });

    describe('GET /', () => {
        it('should render the home page', async () => {
            const res = await agent.get('/');
            expect(res.statusCode).to.equal(200);
            expect(res.text).to.include('<h1>Task Management App</h1>');
            expect(res.text).to.include('<h2>Welcome to the Task Management Application!</h2>');
        });
    });

    describe('GET /tasks', () => {
        it('should render the tasks index page with existing tasks', async () => {
            await Task.create('Task 1', 'Description 1');
            await Task.create('Task 2', 'Description 2', true);

            const res = await agent.get('/tasks');
            expect(res.statusCode).to.equal(200);
            expect(res.text).to.include('<h2>All Tasks</h2>');
            expect(res.text).to.include('Task 1');
            expect(res.text).to.include('Task 2');
            expect(res.text).to.include('completed'); // Should have class for completed task
        });

        it('should render the tasks index page with no tasks', async () => {
            const res = await agent.get('/tasks');
            expect(res.statusCode).to.equal(200);
            expect(res.text).to.include('No tasks found. Why not <a href="/tasks/new">add a new one</a>?');
        });

        it('should handle database errors when fetching tasks', async () => {
            const findAllStub = sinon.stub(Task, 'findAll').throws(new Error('DB read error'));
            const res = await agent.get('/tasks');
            expect(res.statusCode).to.equal(500);
            expect(res.text).to.include('Something went wrong!');
            expect(res.text).to.include('Failed to load tasks.');
            findAllStub.restore();
        });
    });

    describe('GET /tasks/new', () => {
        it('should render the new task form', async () => {
            const res = await agent.get('/tasks/new');
            expect(res.statusCode).to.equal(200);
            expect(res.text).to.include('<h2>Create New Task</h2>');
            expect(res.text).to.include('<form action="/tasks" method="POST">');
        });
    });

    describe('POST /tasks', () => {
        it('should create a new task and redirect to /tasks', async () => {
            const res = await agent.post('/tasks')
                .send({ title: 'New Task', description: 'Task description' })
                .expect(302); // Expect redirect
            expect(res.header.location).to.equal('/tasks');

            const tasks = await Task.findAll();
            expect(tasks).to.have.lengthOf(1);
            expect(tasks[0].title).to.equal('New Task');
        });

        it('should render new task form with error if title is missing', async () => {
            const res = await agent.post('/tasks')
                .send({ title: '', description: 'Task description' })
                .expect(400); // Bad request
            expect(res.text).to.include('Title is required and cannot be empty.');
            expect(res.text).to.include('<h2>Create New Task</h2>'); // Still renders the new task form
        });

        it('should render new task form with error if title is whitespace', async () => {
            const res = await agent.post('/tasks')
                .send({ title: '   ', description: 'Task description' })
                .expect(400); // Bad request
            expect(res.text).to.include('Title is required and cannot be empty.');
        });

        it('should handle database errors when creating a task', async () => {
            const createStub = sinon.stub(Task, 'create').throws(new Error('DB write error'));
            const res = await agent.post('/tasks')
                .send({ title: 'Error Task', description: 'Should fail' })
                .expect(500);
            expect(res.text).to.include('Failed to create task.');
            expect(res.text).to.include('Error Task'); // Pre-fills form
            createStub.restore();
        });
    });

    describe('GET /tasks/:id/edit', () => {
        let createdTask;
        beforeEach(async () => {
            createdTask = await Task.create('Task to Edit', 'Edit this');
        });

        it('should render the edit task form for an existing task', async () => {
            const res = await agent.get(`/tasks/${createdTask.id}/edit`);
            expect(res.statusCode).to.equal(200);
            expect(res.text).to.include(`<h2>Edit Task: ${createdTask.title}</h2>`);
            expect(res.text).to.include(`<input type="text" id="title" name="title" value="${createdTask.title}" required>`);
            expect(res.text).to.include(`<textarea id="description" name="description" rows="5">${createdTask.description}</textarea>`);
        });

        it('should return 404 if task ID not found for edit', async () => {
            const res = await agent.get('/tasks/999/edit');
            expect(res.statusCode).to.equal(404);
            expect(res.text).to.include('Task Not Found');
            expect(res.text).to.include('Task with ID 999 not found.');
        });

        it('should return 400 if task ID is invalid (non-numeric)', async () => {
            const res = await agent.get('/tasks/abc/edit');
            expect(res.statusCode).to.equal(400);
            expect(res.text).to.include('Invalid Task ID provided.');
        });

        it('should return 400 if task ID is invalid (negative)', async () => {
            const res = await agent.get('/tasks/-1/edit');
            expect(res.statusCode).to.equal(400);
            expect(res.text).to.include('Invalid Task ID provided.');
        });

        it('should handle database errors when fetching task for edit', async () => {
            const findByIdStub = sinon.stub(Task, 'findById').throws(new Error('DB read error'));
            const res = await agent.get(`/tasks/${createdTask.id}/edit`);
            expect(res.statusCode).to.equal(500);
            expect(res.text).to.include('Failed to load task for editing.');
            findByIdStub.restore();
        });
    });

    describe('PUT /tasks/:id', () => {
        let createdTask;
        beforeEach(async () => {
            createdTask = await Task.create('Initial Task', 'Initial Description', false);
        });

        it('should update an existing task and redirect to /tasks', async () => {
            const res = await agent.put(`/tasks/${createdTask.id}?_method=PUT`)
                .send({ title: 'Updated Title', description: 'Updated Description', completed: 'on' })
                .expect(302);
            expect(res.header.location).to.equal('/tasks');

            const task = await Task.findById(createdTask.id);
            expect(task.title).to.equal('Updated Title');
            expect(task.description).to.equal('Updated Description');
            expect(task.completed).to.be.true;
        });

        it('should update a task with empty description and completed off', async () => {
            const res = await agent.put(`/tasks/${createdTask.id}?_method=PUT`)
                .send({ title: 'Updated Title Only', description: '', completed: 'off' })
                .expect(302);
            expect(res.header.location).to.equal('/tasks');

            const task = await Task.findById(createdTask.id);
            expect(task.title).to.equal('Updated Title Only');
            expect(task.description).to.equal('');
            expect(task.completed).to.be.false;
        });

        it('should return 404 if task ID not found for update', async () => {
            const res = await agent.put('/tasks/999?_method=PUT')
                .send({ title: 'Non Existent', description: 'Nope', completed: 'on' })
                .expect(404);
            expect(res.text).to.include('Task Not Found');
            expect(res.text).to.include('Task with ID 999 not found for update.');
        });

        it('should return 400 if title is missing during update', async () => {
            const res = await agent.put(`/tasks/${createdTask.id}?_method=PUT`)
                .send({ title: '', description: 'Still description', completed: 'off' })
                .expect(400);
            expect(res.text).to.include('Title is required and cannot be empty.');
            expect(res.text).to.include('Edit Task:'); // Renders edit form
            expect(res.text).to.include('Still description'); // Should pre-fill description
            expect(res.text).to.not.include('checked'); // completed should be off
        });

        it('should return 400 if title is whitespace during update', async () => {
            const res = await agent.put(`/tasks/${createdTask.id}?_method=PUT`)
                .send({ title: '  ', description: 'Still description', completed: 'off' })
                .expect(400);
            expect(res.text).to.include('Title is required and cannot be empty.');
        });

        it('should return 400 if task ID is invalid (non-numeric) during update', async () => {
            const res = await agent.put('/tasks/abc?_method=PUT')
                .send({ title: 'Valid Title', description: 'Desc', completed: 'off' })
                .expect(400);
            expect(res.text).to.include('Invalid Task ID provided for update.');
        });

        it('should handle database errors when updating a task', async () => {
            const updateStub = sinon.stub(Task, 'update').throws(new Error('DB update error'));
            const res = await agent.put(`/tasks/${createdTask.id}?_method=PUT`)
                .send({ title: 'Error Update', description: 'Should fail', completed: 'off' })
                .expect(500);
            expect(res.text).to.include('Failed to update task.');
            expect(res.text).to.include('Error Update'); // Pre-fills form
            updateStub.restore();
        });
    });

    describe('DELETE /tasks/:id', () => {
        let createdTask;
        beforeEach(async () => {
            createdTask = await Task.create('Task to Delete', 'Delete this one');
        });

        it('should delete a task and redirect to /tasks', async () => {
            const res = await agent.post(`/tasks/${createdTask.id}?_method=DELETE`)
                .expect(302);
            expect(res.header.location).to.equal('/tasks');

            const task = await Task.findById(createdTask.id);
            expect(task).to.be.null;
        });

        it('should return 404 if task ID not found for deletion', async () => {
            const res = await agent.post('/tasks/999?_method=DELETE')
                .expect(404);
            expect(res.text).to.include('Task Not Found');
            expect(res.text).to.include('Task with ID 999 not found for deletion.');
        });

        it('should return 400 if task ID is invalid (non-numeric) for deletion', async () => {
            const res = await agent.post('/tasks/xyz?_method=DELETE')
                .expect(400);
            expect(res.text).to.include('Invalid Task ID provided for deletion.');
        });

        it('should handle database errors when deleting a task', async () => {
            const deleteStub = sinon.stub(Task, 'delete').throws(new Error('DB delete error'));
            const res = await agent.post(`/tasks/${createdTask.id}?_method=DELETE`)
                .expect(500);
            expect(res.text).to.include('Failed to delete task.');
            deleteStub.restore();
        });
    });

    describe('Error Handling Middleware', () => {
        it('should catch errors thrown in routes and render error page with 500 status', async () => {
            // Temporarily add a route that throws an error
            app.get('/test-error', (req, res, next) => {
                next(new Error('Intentional Test Error'));
            });

            const res = await agent.get('/test-error');
            expect(res.statusCode).to.equal(500);
            expect(res.text).to.include('Something went wrong!');
            expect(res.text).to.include('Error');
            expect(res.text).to.not.include('Intentional Test Error'); // Should not show error message in non-dev env

            // To clean up the added route, normally you'd restart the app or use a more sophisticated testing setup.
            // For this simple case, the route remains, but it doesn't affect other tests.
        });
    });
});
