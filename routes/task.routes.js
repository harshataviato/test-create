/**
 * Task Routes
 * Maps URLs to Controller functions.
 */
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');

// GET request for the homepage
router.get('/', taskController.index);

// POST request to create a task
router.post('/tasks', taskController.addTask);

// GET request to toggle status (simulating a PUT for simple form submission)
router.get('/tasks/toggle/:id', taskController.toggleTask);

// GET request to delete (simulating a DELETE for simple form submission)
router.get('/tasks/delete/:id', taskController.deleteTask);

module.exports = router;
