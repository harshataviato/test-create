-- db/init.sql
-- This script initializes the database schema for the task management application.

-- Create the 'tasks' table if it does not already exist.
-- This table stores information about each task.
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT, -- Unique identifier for each task, auto-increments
    title TEXT NOT NULL,                  -- The title of the task, cannot be empty
    description TEXT,                     -- An optional longer description for the task
    completed BOOLEAN DEFAULT 0,          -- Status of the task (0 for incomplete, 1 for complete), defaults to incomplete
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the task was created
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the task was last updated
);

-- Create a trigger to automatically update the 'updated_at' column
-- whenever a row in the 'tasks' table is modified.
CREATE TRIGGER IF NOT EXISTS update_tasks_updated_at
AFTER UPDATE ON tasks
FOR EACH ROW
BEGIN
    UPDATE tasks SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
