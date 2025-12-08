/**
 * @module middlewares/errorHandler
 * @description Global error handling middleware for Express.js.
 *              Catches errors, logs them, and renders appropriate error pages.
 */

import { Request, Response, NextFunction } from 'express';
import { HttpError } from '@utils/errors'; // Assuming HttpError is defined in @utils/errors
import i18n from 'i18next';

/**
 * @function errorHandler
 * @description Global error handling middleware.
 *              Determines the error type and renders a user-friendly error page.
 * @param {Error | HttpError} err - The error object caught by Express.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function (not used here as this is a terminal error handler).
 */
export function errorHandler(err: Error | HttpError, req: Request, res: Response, next: NextFunction): void {
  const status = err instanceof HttpError ? err.status : 500;
  const message = err.message || i18n.t('error.general');

  console.error(`Error ${status}: ${message}`, err.stack); // Log the error for debugging

  // Determine the error message to display based on status code
  let displayMessage: string;
  switch (status) {
    case 404:
      displayMessage = i18n.t('error.404');
      break;
    case 500:
      displayMessage = i18n.t('error.500');
      break;
    default:
      displayMessage = i18n.t('error.general');
      break;
  }

  // Set the response status
  res.status(status);

  // Render the error page with appropriate data
  res.render('error', {
    status: status,
    message: displayMessage, // User-friendly message
    debugMessage: message, // Original error message (for more detail if needed in development)
    // Pass original error details for more specific error handling in templates if desired
    error: err,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, // Stack trace only in dev
    menu: 'error' // Highlight error in navigation
  });
}
