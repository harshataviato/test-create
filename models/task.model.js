/**
 * Task Model
 * Pragmatic implementation of a Data Access Object (DAO).
 * In a real-world scenario, this would connect to a DB like MongoDB or PostgreSQL.
 */

// In-memory storage to ensure the app is fully functional immediately
let tasks = [
    { id: 1, title: 'Learn Node.js MVC', completed: false },
    { id: 2, title: 'Convert Java to JavaScript', completed: true }
];

class TaskModel {
    /**
     * Fetches all tasks from the data store.
     * @returns {Array} List of tasks
     */
    static findAll() {
        return tasks;
    }

    /**
     * Persists a new task.
     * @param {string} title 
     * @returns {Object} The created task
     */
    static create(title) {
        const newTask = {
            id: tasks.length > 0 ? tasks[tasks.length - 1].id + 1 : 1,
            title: title,
            completed: false
        };
        tasks.push(newTask);
        return newTask;
    }

    /**
     * Deletes a task by ID.
     * @param {number} id 
     */
    static deleteById(id) {
        tasks = tasks.filter(task => task.id !== parseInt(id));
    }

    /**
     * Toggles the completion status of a task.
     * @param {number} id 
     */
    static toggleStatus(id) {
        const task = tasks.find(t => t.id === parseInt(id));
        if (task) {
            task.completed = !task.completed;
        }
    }
}

module.exports = TaskModel;
