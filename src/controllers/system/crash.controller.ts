/**
 * @module controllers/system/crash.controller
 * @description
 * Controller for triggering an artificial runtime exception to demonstrate
 * the application's error handling capabilities.
 */

import { Router, Request, Response, NextFunction } from 'express';

const router = Router();

/**
 * Handles GET requests to '/oups'.
 * This route is specifically designed to throw a runtime exception,
 * allowing demonstration and testing of the application's error handling middleware.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function.
 * @throws {Error} Always throws a RuntimeException with a descriptive message.
 */
router.get('/oups', (req: Request, res: Response, next: NextFunction) => {
  // Simulates an unexpected error condition
  throw new Error("Expected: controller used to showcase what happens when an exception is thrown");
});

export default router;

