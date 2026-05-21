/**
 * @module controllers/taskController
 * @description Handles HTTP requests related to task management.
 *              Interacts with the Task model to perform CRUD operations and renders appropriate views.
 */

const Task = require('../models/taskModel'); // Import the Task model

/**
 * @function getAllTasks
 * @description Renders a list of all tasks.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @returns {void} Sends the rendered EJS page.
 */
exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.findAll(); // Fetch all tasks from the database
        res.render('tasks/index', { title: 'All Tasks', tasks: tasks }); // Render the tasks index view with data
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).render('error', { title: 'Error', message: 'Failed to load tasks.', error: error });
    }
};

/**
 * @function getNewTaskForm
 * @description Renders the form for creating a new task.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @returns {void} Sends the rendered EJS page.
 */
exports.getNewTaskForm = (req, res) => {
    res.render('tasks/new', { title: 'Create New Task' }); // Render the new task form view
};

/**
 * @function createTask
 * @description Creates a new task based on form submission.
 * @param {object} req - The Express request object, containing form data in `req.body`.
 * @param {object} res - The Express response object.
 * @returns {void} Redirects to the tasks list or renders an error page.
 */
exports.createTask = async (req, res) => {
    const { title, description } = req.body; // Extract title and description from the request body

    // Basic validation for title presence
    if (!title) {
        return res.status(400).render('tasks/new', {
            title: 'Create New Task',
            error: 'Title is required.',
            task: { title, description } // Pass back entered data for user convenience
        });
    }

    try {
        await Task.create(title, description); // Create the task using the Task model
        res.redirect('/tasks'); // Redirect to the list of tasks after successful creation
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).render('tasks/new', { // Render the form again with an error message
            title: 'Create New Task',
            error: 'Failed to create task.',
            task: { title, description } // Keep user input in the form
        });
    }
};

/**
 * @function getEditTaskForm
 * @description Renders the form for editing an existing task.
 * @param {object} req - The Express request object, containing task ID in `req.params.id`.
 * @param {object} res - The Express response object.
 * @returns {void} Sends the rendered EJS page or redirects if task not found.
 */
exports.getEditTaskForm = async (req, res) => {
    const taskId = parseInt(req.params.id, 10); // Get task ID from URL parameters and convert to integer

    // Validate if taskId is a valid number
    if (isNaN(taskId)) {
        return res.status(400).render('error', { title: 'Error', message: 'Invalid Task ID provided.' });
    }

    try {
        const task = await Task.findById(taskId); // Find the task by its ID
        if (!task) {
            // If task is not found, redirect or show a 404 page
            return res.status(404).render('error', { title: 'Task Not Found', message: `Task with ID ${taskId} not found.` });
        }
        res.render('tasks/edit', { title: `Edit Task: ${task.title}`, task: task }); // Render the edit form with task data
    } catch (error) {
        console.error(`Error fetching task ${taskId} for edit:`, error);
        res.status(500).render('error', { title: 'Error', message: 'Failed to load task for editing.', error: error });
    }
};

/**
 * @function updateTask
 * @description Updates an existing task based on form submission.
 * @param {object} req - The Express request object, containing task ID in `req.params.id` and form data in `req.body`.
 * @param {object} res - The Express response object.
 * @returns {void} Redirects to the tasks list or renders an error page.
 */
exports.updateTask = async (req, res) => {
    const taskId = parseInt(req.params.id, 10); // Get task ID from URL parameters
    const { title, description, completed } = req.body; // Extract updated data from request body

    // Convert 'on' from checkbox to true, otherwise false
    const isCompleted = completed === 'on' ? true : false;

    // Basic validation for taskId and title
    if (isNaN(taskId) || !title) {
        return res.status(400).render('error', { title: 'Error', message: 'Invalid Task ID or missing title.' });
    }

    try {
        const updated = await Task.update(taskId, title, description, isCompleted); // Update the task
        if (!updated) {
            // If update returns false, it means the task was not found
            return res.status(404).render('error', { title: 'Task Not Found', message: `Task with ID ${taskId} not found for update.` });
        }
        res.redirect('/tasks'); // Redirect to the list of tasks after successful update
    } catch (error) {
        console.error(`Error updating task with ID ${taskId}:`, error);
        // If an error occurs, re-render the edit form with the error message and current data
        res.status(500).render('tasks/edit', {
            title: `Edit Task: ${title}`,
            error: 'Failed to update task.',
            task: { id: taskId, title, description, completed: isCompleted } // Pass back entered data
        });
    }
};

/**
 * @function deleteTask
 * @description Deletes a task by its ID.
 * @param {object} req - The Express request object, containing task ID in `req.params.id`.
 * @param {object} res - The Express response object.
 * @returns {void} Redirects to the tasks list or renders an error page.
 */
exports.deleteTask = async (req, res) => {
    const taskId = parseInt(req.params.id, 10); // Get task ID from URL parameters

    // Validate if taskId is a valid number
    if (isNaN(taskId)) {
        return res.status(400).render('error', { title: 'Error', message: 'Invalid Task ID provided for deletion.' });
    }

    try {
        const deleted = await Task.delete(taskId); // Delete the task
        if (!deleted) {
            // If delete returns false, it means the task was not found
            return res.status(404).render('error', { title: 'Task Not Found', message: `Task with ID ${taskId} not found for deletion.` });
        }
        res.redirect('/tasks'); // Redirect to the list of tasks after successful deletion
    } catch (error) {
        console.error(`Error deleting task with ID ${taskId}:`, error);
        res.status(500).render('error', { title: 'Error', message: 'Failed to delete task.', error: error });
    }
};
