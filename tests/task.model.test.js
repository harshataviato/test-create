const expect = require('chai').expect;
const TaskModel = require('../models/task.model');

describe('Task Model Tests', () => {
    
    it('should fetch all tasks', () => {
        const tasks = TaskModel.findAll();
        expect(tasks).to.be.an('array');
        expect(tasks.length).to.be.at.least(2); // Initial seed data
    });

    it('should create a new task with incremented ID', () => {
        const initialTasks = TaskModel.findAll();
        const lastId = initialTasks.length > 0 ? initialTasks[initialTasks.length - 1].id : 0;
        
        const newTask = TaskModel.create('Test Task');
        
        expect(newTask.title).to.equal('Test Task');
        expect(newTask.completed).to.be.false;
        expect(newTask.id).to.equal(lastId + 1);
    });

    it('should toggle the status of a task from false to true', () => {
        const task = TaskModel.create('Toggle Test');
        const id = task.id;
        
        TaskModel.toggleStatus(id);
        const updatedTask = TaskModel.findAll().find(t => t.id === id);
        expect(updatedTask.completed).to.be.true;

        TaskModel.toggleStatus(id);
        expect(updatedTask.completed).to.be.false;
    });

    it('should not throw error when toggling non-existent task', () => {
        expect(() => TaskModel.toggleStatus(99999)).to.not.throw();
    });

    it('should delete a task by ID', () => {
        const task = TaskModel.create('Delete Me');
        const id = task.id;
        
        TaskModel.deleteById(id);
        const tasks = TaskModel.findAll();
        const found = tasks.find(t => t.id === id);
        expect(found).to.be.undefined;
    });

    it('should handle deleting non-existent ID gracefully', () => {
        const initialCount = TaskModel.findAll().length;
        TaskModel.deleteById(88888);
        expect(TaskModel.findAll().length).to.equal(initialCount);
    });
});
