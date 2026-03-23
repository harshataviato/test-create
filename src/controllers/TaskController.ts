/**
 * Module: Task Controller
 * Description: Handles HTTP requests, processes business logic, and returns Views.
 * Conceptually equivalent to a @Controller class in Java Spring MVC.
 */

import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Task } from "../models/Task";

export class TaskController {
    // Repository acts as our Data Access Object (DAO)
    private taskRepository = AppDataSource.getRepository(Task);

    /**
     * Retrieves all tasks and renders the index view.
     * @param req Express Request object
     * @param res Express Response object
     */
    public getAllTasks = async (req: Request, res: Response): Promise<void> => {
        try {
            // Fetch all tasks, ordered by creation date descending
            const tasks = await this.taskRepository.find({
                order: { createdAt: "DESC" }
            });
            
            // Pass the tasks to the 'index' EJS template
            res.render("index", { tasks });
        } catch (error) {
            console.error("Error fetching tasks:", error);
            res.status(500).send("Internal Server Error");
        }
    };

    /**
     * Renders the form to create a new task.
     * @param req Express Request object
     * @param res Express Response object
     */
    public getNewTaskForm = (req: Request, res: Response): void => {
        res.render("new");
    };

    /**
     * Processes the creation of a new task.
     * Business Rule: Title is mandatory. If empty, redirects back to form.
     * @param req Express Request object containing form payload in body
     * @param res Express Response object
     */
    public createTask = async (req: Request, res: Response): Promise<void> => {
        try {
            const { title, description } = req.body;

            // Simple validation: Ensure title exists and is not just whitespace
            if (!title || title.trim() === "") {
                return res.redirect("/new"); 
            }

            // Create a new Task instance and save it via the repository
            const task = new Task();
            task.title = title.trim();
            task.description = description ? description.trim() : "";
            
            await this.taskRepository.save(task);

            // Redirect to the list view after successful creation (Post-Redirect-Get pattern)
            res.redirect("/");
        } catch (error) {
            console.error("Error creating task:", error);
            res.status(500).send("Internal Server Error");
        }
    };

    /**
     * Renders the form to edit an existing task.
     * Edge case: Requested ID might not exist in the database.
     * @param req Express Request object (contains ID in params)
     * @param res Express Response object
     */
    public getEditTaskForm = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            const task = await this.taskRepository.findOneBy({ id });

            if (!task) {
                res.status(404).send("Task not found");
                return;
            }

            res.render("edit", { task });
        } catch (error) {
            console.error("Error fetching task for edit:", error);
            res.status(500).send("Internal Server Error");
        }
    };

    /**
     * Processes the update of an existing task.
     * @param req Express Request object (contains ID in params, updated fields in body)
     * @param res Express Response object
     */
    public updateTask = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            const { title, description, isCompleted } = req.body;

            const task = await this.taskRepository.findOneBy({ id });

            if (!task) {
                res.status(404).send("Task not found");
                return;
            }

            // Update fields. HTML checkboxes only send a value if checked.
            // Therefore, if req.body.isCompleted is 'on', it equates to true.
            task.title = title.trim();
            task.description = description ? description.trim() : "";
            task.isCompleted = isCompleted === "on";

            await this.taskRepository.save(task);

            res.redirect("/");
        } catch (error) {
            console.error("Error updating task:", error);
            res.status(500).send("Internal Server Error");
        }
    };

    /**
     * Deletes a task from the database.
     * @param req Express Request object (contains ID in params)
     * @param res Express Response object
     */
    public deleteTask = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            const task = await this.taskRepository.findOneBy({ id });

            if (task) {
                await this.taskRepository.remove(task);
            }

            res.redirect("/");
        } catch (error) {
            console.error("Error deleting task:", error);
            res.status(500).send("Internal Server Error");
        }
    };
}
