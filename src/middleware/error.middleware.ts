/**
 * @module middleware/error.middleware
 * @description
 * Contains Express.js error handling middleware.
 * Includes a 404 Not Found handler and a general error handler.
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to handle 404 Not Found errors.
 * If no route matches a request, this middleware will be called,
 * rendering a generic error page with a 404 status.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function (unused here but required by signature).
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  // Set the HTTP status code to 404
  res.status(404);
  // Render the error.ejs template with a specific 404 message
  res.render('error', {
    status: 404,
    message: req.t('error.404'), // Translate using i18n
    menu: 'error'
  });
};

/**
 * General error handling middleware.
 * This middleware catches any errors thrown by route handlers or other middleware.
 * It logs the error and renders an appropriate error page based on the error's status.
 *
 * @param {Error} err - The error object caught by Express.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function (unused here but required by signature).
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Application Error:', err.stack); // Log the stack trace for debugging

  // Determine the HTTP status code. Default to 500 if not explicitly set.
  const status = (res.statusCode && res.statusCode !== 200) ? res.statusCode : 500;
  res.status(status);

  let errorMessage: string;
  if (status === 404) {
    errorMessage = req.t('error.404');
  } else if (status === 500) {
    errorMessage = req.t('error.500');
  } else {
    errorMessage = req.t('error.general');
  }

  // Render the error.ejs template
  res.render('error', {
    status: status,
    message: err.message || errorMessage, // Show actual error message if available, else generic
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, // Show stack in dev mode
    menu: 'error'
  });
};
