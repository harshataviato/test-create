/**
 * @file Error handling middleware for Express.js.
 * @description Provides a centralized way to catch and handle errors across the application.
 * It distinguishes between 404 (Not Found) errors and other internal server errors (500).
 * @author Google Senior Engineer
 */

const HttpStatus = require('http-status-codes');

/**
 * Handles 404 Not Found errors.
 * This middleware should be placed after all other routes to catch any unhandled requests.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 */
function handleNotFound(req, res, next) {
  // If no route handled the request, it's a 404
  res.status(HttpStatus.StatusCodes.NOT_FOUND).render('error', {
    status: HttpStatus.StatusCodes.NOT_FOUND,
    message: res.__('error.404'), // Use i18n for error messages
    title: res.__('error') // Title for the error page
  });
}

/**
 * General error handling middleware.
 * This middleware catches any errors thrown by previous middleware or route handlers.
 * @param {Error} err - The error object.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 */
function handleErrors(err, req, res, next) {
  // Log the error for debugging purposes
  console.error(err.stack);

  // Determine the HTTP status code
  const status = err.statusCode || HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR; // Use error's status code if available, else 500
  const message = err.message || res.__('error.500'); // Use error's message if available, else a generic 500 message

  // Render the error page
  res.status(status).render('error', {
    status,
    message,
    // Provide full error stack in development for debugging
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    title: res.__('error')
  });
}

module.exports = {
  handleNotFound,
  handleErrors
};
