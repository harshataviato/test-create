/**
 * @module routes/taskRoutes
 * @description Defines all HTTP routes for task management and maps them to corresponding controller functions.
 *              Uses Express's Router to modularize routes.
 */

const express = require('express');        // Import the Express framework
const router = express.Router();           // Create a new router instance
const taskController = require('../controllers/taskController'); // Import the task controller

/**
 * @route GET /tasks
 * @description Route to display a list of all tasks.
 *              Calls `taskController.getAllTasks` to fetch and render tasks.
 */
router.get('/', taskController.getAllTasks);

/**
 * @route GET /tasks/new
 * @description Route to display the form for creating a new task.
 *              Calls `taskController.getNewTaskForm` to render the creation form.
 */
router.get('/new', taskController.getNewTaskForm);

/**
 * @route POST /tasks
 * @description Route to submit data for creating a new task.
 *              Calls `taskController.createTask` to handle the task creation logic.
 */
router.post('/', taskController.createTask);

/**
 * @route GET /tasks/:id/edit
 * @description Route to display the form for editing an existing task.
 *              The `:id` parameter captures the task's unique identifier.
 *              Calls `taskController.getEditTaskForm` to fetch task data and render the edit form.
 */
router.get('/:id/edit', taskController.getEditTaskForm);

/**
 * @route PUT /tasks/:id
 * @description Route to submit data for updating an existing task.
 *              Uses HTTP PUT method (enabled by method-override middleware).
 *              The `:id` parameter specifies which task to update.
 *              Calls `taskController.updateTask` to handle the update logic.
 */
router.put('/:id', taskController.updateTask);

/**
 * @route DELETE /tasks/:id
 * @description Route to delete a specific task.
 *              Uses HTTP DELETE method (enabled by method-override middleware).
 *              The `:id` parameter specifies which task to delete.
 *              Calls `taskController.deleteTask` to handle the deletion logic.
 */
router.delete('/:id', taskController.deleteTask);

module.exports = router; // Export the router instance
