/**
 * Task Controller
 * Handles incoming web requests and bridges the View with the Model.
 */
const TaskModel = require('../models/task.model');

/**
 * Renders the main dashboard with all tasks.
 */
exports.index = (req, res) => {
    const tasks = TaskModel.findAll();
    res.render('index', { tasks });
};

/**
 * Logic to add a new task.
 * Redirects back to index on success.
 */
exports.addTask = (req, res) => {
    const { title } = req.body;
    if (title && title.trim().length > 0) {
        TaskModel.create(title);
    }
    res.redirect('/');
};

/**
 * Logic to toggle the 'completed' state of a task.
 */
exports.toggleTask = (req, res) => {
    TaskModel.toggleStatus(req.params.id);
    res.redirect('/');
};

/**
 * Logic to remove a task.
 */
exports.deleteTask = (req, res) => {
    TaskModel.deleteById(req.params.id);
    res.redirect('/');
};
