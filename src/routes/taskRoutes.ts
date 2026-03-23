/**
 * Module: Task Routes
 * Description: Maps HTTP verbs and URL paths to Controller methods.
 * This replaces Java's @RequestMapping or @GetMapping annotations.
 */

import { Router } from "express";
import { TaskController } from "../controllers/TaskController";

const router = Router();
const taskController = new TaskController();

// GET / - Display all tasks
router.get("/", taskController.getAllTasks);

// GET /new - Display form to create a new task
router.get("/new", taskController.getNewTaskForm);

// POST /new - Process new task form submission
router.post("/new", taskController.createTask);

// GET /edit/:id - Display form to edit a specific task
router.get("/edit/:id", taskController.getEditTaskForm);

// POST /edit/:id - Process edit task form submission
router.post("/edit/:id", taskController.updateTask);

// POST /delete/:id - Process task deletion
// Note: Using POST for deletion since standard HTML forms do not support DELETE methods natively
router.post("/delete/:id", taskController.deleteTask);

export default router;
