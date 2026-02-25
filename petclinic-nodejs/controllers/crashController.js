/**
 * @fileoverview Controller to demonstrate error handling by triggering an exception.
 * This module provides a route that intentionally throws a runtime error.
 */

/**
 * Triggers a runtime exception.
 * This function is designed to be called via a GET request to '/oups' to demonstrate
 * how the application's global error handler (errorHandler.js) catches and processes
 * unexpected errors.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @throws {Error} A generic runtime error with a predefined message.
 */
exports.triggerException = (req, res, next) => {
    // Intentionally throw an error to simulate a crash or unexpected condition.
    // The error handling middleware in app.js will catch this and render the error page.
    throw new Error("Expected: controller used to showcase what happens when an exception is thrown");
};
