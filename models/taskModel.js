/**
 * @module models/taskModel
 * @description Defines the Task model and provides methods for interacting with the 'tasks' table in the database.
 */

const { getDb } = require('../config/db'); // Import the database connection utility

/**
 * @class Task
 * @description Represents a Task entity and encapsulates database operations related to tasks.
 */
class Task {
    /**
     * @constructor
     * @param {number} [id] - The unique identifier of the task (optional, for existing tasks).
     * @param {string} title - The title of the task.
     * @param {string} description - The description of the task.
     * @param {boolean} completed - The completion status of the task (true/false).
     * @param {string} [createdAt] - The timestamp when the task was created (optional).
     * @param {string} [updatedAt] - The timestamp when the task was last updated (optional).
     */
    constructor(id, title, description, completed, createdAt, updatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.completed = completed;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    /**
     * @static
     * @async
     * @function create
     * @description Inserts a new task into the database.
     * @param {string} title - The title of the new task.
     * @param {string} description - The description of the new task.
     * @param {boolean} [completed=false] - The initial completion status of the task. Defaults to false.
     * @returns {Promise<Task>} A promise that resolves with the newly created Task object, including its generated ID.
     * @throws {Error} If the database operation fails.
     */
    static async create(title, description, completed = false) {
        const db = await getDb(); // Get the database instance
        const sql = `INSERT INTO tasks (title, description, completed) VALUES (?, ?, ?)`; // SQL statement to insert a new task
        return new Promise((resolve, reject) => {
            db.run(sql, [title, description, completed ? 1 : 0], function (err) {
                if (err) {
                    console.error('Error creating task:', err.message);
                    return reject(new Error('Could not create task.'));
                }
                // Fetch the newly created task to get all its properties including timestamps
                // `this.lastID` is the ID of the last inserted row, available via `function` keyword
                Task.findById(this.lastID)
                    .then(resolve)
                    .catch(reject);
            });
        });
    }

    /**
     * @static
     * @async
     * @function findAll
     * @description Retrieves all tasks from the database.
     * @returns {Promise<Task[]>} A promise that resolves with an array of Task objects.
     * @throws {Error} If the database operation fails.
     */
    static async findAll() {
        const db = await getDb(); // Get the database instance
        const sql = `SELECT id, title, description, completed, created_at, updated_at FROM tasks ORDER BY created_at DESC`; // SQL statement to select all tasks
        return new Promise((resolve, reject) => {
            db.all(sql, [], (err, rows) => {
                if (err) {
                    console.error('Error fetching all tasks:', err.message);
                    return reject(new Error('Could not retrieve tasks.'));
                }
                // Map database rows to Task objects
                const tasks = rows.map(row => new Task(
                    row.id,
                    row.title,
                    row.description,
                    Boolean(row.completed), // Convert integer 0/1 back to boolean
                    row.created_at,
                    row.updated_at
                ));
                resolve(tasks);
            });
        });
    }

    /**
     * @static
     * @async
     * @function findById
     * @description Retrieves a single task by its ID from the database.
     * @param {number} id - The unique identifier of the task to retrieve.
     * @returns {Promise<Task|null>} A promise that resolves with the Task object if found, otherwise null.
     * @throws {Error} If the database operation fails.
     */
    static async findById(id) {
        const db = await getDb(); // Get the database instance
        const sql = `SELECT id, title, description, completed, created_at, updated_at FROM tasks WHERE id = ?`; // SQL statement to select a task by ID
        return new Promise((resolve, reject) => {
            db.get(sql, [id], (err, row) => {
                if (err) {
                    console.error(`Error fetching task with ID ${id}:`, err.message);
                    return reject(new Error('Could not retrieve task.'));
                }
                if (!row) {
                    return resolve(null); // Task not found
                }
                // Create and return a new Task object from the row data
                resolve(new Task(
                    row.id,
                    row.title,
                    row.description,
                    Boolean(row.completed),
                    row.created_at,
                    row.updated_at
                ));
            });
        });
    }

    /**
     * @static
     * @async
     * @function update
     * @description Updates an existing task in the database.
     * @param {number} id - The ID of the task to update.
     * @param {string} title - The new title for the task.
     * @param {string} description - The new description for the task.
     * @param {boolean} completed - The new completion status for the task.
     * @returns {Promise<boolean>} A promise that resolves to true if the task was updated, false if not found.
     * @throws {Error} If the database operation fails.
     */
    static async update(id, title, description, completed) {
        const db = await getDb(); // Get the database instance
        // SQL statement to update a task, using the trigger to update `updated_at`
        const sql = `UPDATE tasks SET title = ?, description = ?, completed = ? WHERE id = ?`;
        return new Promise((resolve, reject) => {
            db.run(sql, [title, description, completed ? 1 : 0, id], function (err) {
                if (err) {
                    console.error(`Error updating task with ID ${id}:`, err.message);
                    return reject(new Error('Could not update task.'));
                }
                // 'this.changes' indicates the number of rows affected by the update.
                // If 0, no task with the given ID was found.
                resolve(this.changes > 0);
            });
        });
    }

    /**
     * @static
     * @async
     * @function delete
     * @description Deletes a task from the database by its ID.
     * @param {number} id - The ID of the task to delete.
     * @returns {Promise<boolean>} A promise that resolves to true if the task was deleted, false if not found.
     * @throws {Error} If the database operation fails.
     */
    static async delete(id) {
        const db = await getDb(); // Get the database instance
        const sql = `DELETE FROM tasks WHERE id = ?`; // SQL statement to delete a task
        return new Promise((resolve, reject) => {
            db.run(sql, [id], function (err) {
                if (err) {
                    console.error(`Error deleting task with ID ${id}:`, err.message);
                    return reject(new Error('Could not delete task.'));
                }
                // 'this.changes' indicates the number of rows affected by the delete.
                // If 0, no task with the given ID was found.
                resolve(this.changes > 0);
            });
        });
    }
}

module.exports = Task; // Export the Task class
