/**
 * @module controllers/system/welcome.controller
 * @description
 * Controller for the application's welcome page.
 */

import { Router, Request, Response } from 'express';

const router = Router();

/**
 * Handles GET requests to the root path '/'.
 * Renders the welcome page.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 */
router.get('/', (req: Request, res: Response) => {
  // Render the 'welcome' EJS template
  res.render('welcome', { menu: 'home' });
});

export default router;

