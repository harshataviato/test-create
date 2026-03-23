/**
 * Module: User Controller
 * Description: Handles incoming HTTP requests related to Users.
 * Equivalent to a Java @RestController or @Controller class in Spring MVC.
 */

import { Request, Response } from 'express';
import { AppDataSource } from '../database';
import { User } from '../models/User';

export class UserController {
    // Repository handles database operations for the User entity
    private userRepository = AppDataSource.getRepository(User);

    /**
     * Retrieves all users from the database and renders the list view.
     * 
     * @param req - The Express Request object
     * @param res - The Express Response object
     * @returns Promise<void> - Renders the 'users/index' view
     */
    public async getAllUsers(req: Request, res: Response): Promise<void> {
        try {
            // Fetch all users sorted by ID descending
            const users = await this.userRepository.find({
                order: { id: "DESC" }
            });
            // Render the EJS template and pass the users array to it
            res.render('users/index', { users });
        } catch (error) {
            console.error("Error fetching users:", error);
            res.status(500).send("Internal Server Error");
        }
    }

    /**
     * Displays the HTML form to create a new user.
     * 
     * @param req - The Express Request object
     * @param res - The Express Response object
     * @returns void - Renders the 'users/create' view
     */
    public getCreateForm(req: Request, res: Response): void {
        res.render('users/create', { error: null });
    }

    /**
     * Processes the form submission to create a new user in the database.
     * Includes basic validation and edge-case handling.
     * 
     * @param req - The Express Request object containing form payload
     * @param res - The Express Response object
     * @returns Promise<void> - Redirects to user list or re-renders form with errors
     */
    public async createUser(req: Request, res: Response): Promise<void> {
        const { firstName, lastName, email } = req.body;

        // Business Rule: All fields are mandatory
        if (!firstName || !lastName || !email) {
            return res.render('users/create', { 
                error: "All fields (First Name, Last Name, Email) are required." 
            });
        }

        try {
            // Check for existing user with the same email to enforce unique constraint
            const existingUser = await this.userRepository.findOneBy({ email });
            if (existingUser) {
                return res.render('users/create', { 
                    error: "A user with this email already exists." 
                });
            }

            // Create a new User instance and save it to the database
            const newUser = new User();
            newUser.firstName = firstName;
            newUser.lastName = lastName;
            newUser.email = email;
            newUser.isActive = true;

            await this.userRepository.save(newUser);

            // Redirect back to the user list upon successful creation
            res.redirect('/users');
        } catch (error) {
            console.error("Error saving user:", error);
            res.render('users/create', { error: "An unexpected error occurred while saving." });
        }
    }

    /**
     * Deletes a user from the database by their ID.
     * 
     * @param req - The Express Request object containing route parameters
     * @param res - The Express Response object
     * @returns Promise<void> - Redirects to the user list
     */
    public async deleteUser(req: Request, res: Response): Promise<void> {
        const userId = parseInt(req.params.id, 10);

        try {
            // Find user first to ensure they exist
            const user = await this.userRepository.findOneBy({ id: userId });
            
            if (user) {
                // Remove the user from the database
                await this.userRepository.remove(user);
            }
            res.redirect('/users');
        } catch (error) {
            console.error("Error deleting user:", error);
            res.status(500).send("Internal Server Error");
        }
    }
}
