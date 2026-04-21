const request = require('supertest');
const expect = require('chai').expect;
const app = require('../app');
const TaskModel = require('../models/task.model');

describe('Task Routes & Controller Integration Tests', () => {

    describe('GET /', () => {
        it('should render the index page with tasks', (done) => {
            request(app)
                .get('/')
                .expect(200)
                .expect('Content-Type', /html/)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.text).to.contain('Task Manager');
                    expect(res.text).to.contain('Learn Node.js MVC');
                    done();
                });
        });
    });

    describe('POST /tasks', () => {
        it('should create a new task and redirect to home', (done) => {
            request(app)
                .post('/tasks')
                .send('title=Integration+Test+Task')
                .expect(302)
                .expect('Location', '/')
                .end((err, res) => {
                    if (err) return done(err);
                    const tasks = TaskModel.findAll();
                    const created = tasks.find(t => t.title === 'Integration Test Task');
                    expect(created).to.exist;
                    done();
                });
        });

        it('should not create a task if title is empty or whitespace', (done) => {
            const initialCount = TaskModel.findAll().length;
            request(app)
                .post('/tasks')
                .send('title=   ')
                .expect(302)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(TaskModel.findAll().length).to.equal(initialCount);
                    done();
                });
        });
    });

    describe('GET /tasks/toggle/:id', () => {
        it('should toggle task completion status and redirect', (done) => {
            const task = TaskModel.create('Toggle Route Test');
            const initialState = task.completed;

            request(app)
                .get(`/tasks/toggle/${task.id}`)
                .expect(302)
                .expect('Location', '/')
                .end((err, res) => {
                    if (err) return done(err);
                    const updatedTask = TaskModel.findAll().find(t => t.id === task.id);
                    expect(updatedTask.completed).to.equal(!initialState);
                    done();
                });
        });

        it('should redirect even if ID is invalid', (done) => {
            request(app)
                .get('/tasks/toggle/99999')
                .expect(302)
                .expect('Location', '/')
                .done(done);
        });
    });

    describe('GET /tasks/delete/:id', () => {
        it('should delete task and redirect', (done) => {
            const task = TaskModel.create('Delete Route Test');
            
            request(app)
                .get(`/tasks/delete/${task.id}`)
                .expect(302)
                .expect('Location', '/')
                .end((err, res) => {
                    if (err) return done(err);
                    const found = TaskModel.findAll().find(t => t.id === task.id);
                    expect(found).to.not.exist;
                    done();
                });
        });

        it('should redirect even if ID is invalid', (done) => {
            request(app)
                .get('/tasks/delete/invalid_id')
                .expect(302)
                .expect('Location', '/')
                .done(done);
        });
    });
});
