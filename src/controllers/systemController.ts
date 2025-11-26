/**
 * @module controllers/systemController
 * @description Handles system-level HTTP requests, such as the welcome page and a crash trigger.
 */

import { Request, Response, NextFunction, Router } from 'express';

const router = Router();

/**
 * GET /
 * @description Renders the welcome page of the application.
 * Sets the active menu item to 'home'.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 */
router.get('/', (req: Request, res: Response) => {
  res.render('welcome', { menu: 'home' });
});

/**
 * GET /oups
 * @description Triggers a runtime exception to demonstrate error handling.
 * This route is used to showcase how unhandled exceptions are caught by the
 * Express error handling middleware, similar to Spring's CrashController.
 * @throws {Error} An intentional runtime error.
 */
router.get('/oups', (req: Request, res: Response, next: NextFunction) => {
  // Intentionally throw an error to trigger the error handling middleware
  const error = new Error('Expected: controller used to showcase what happens when an exception is thrown');
  next(error); // Pass the error to the next error handling middleware
});

export default router;
