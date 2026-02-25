/**
 * @fileoverview Global error handling middleware for the Express application.
 * This middleware catches any errors that occur during request processing
 * and renders an appropriate error page.
 */

/**
 * Error handling middleware.
 * This function is designed to be the last middleware in the Express chain.
 * It distinguishes between 404 (Not Found) errors and other internal server errors,
 * rendering a generic error page for both.
 * @param {Error} err - The error object caught from a preceding middleware or route.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function (though typically not called here as this is a terminal handler).
 */
const errorHandler = (err, req, res, next) => {
    console.error('Application Error:', err); // Log the error for debugging

    // Determine the HTTP status code
    const status = err.status || 500; // Default to 500 Internal Server Error if not specified
    const message = err.message || res.__('error.general'); // Use error message or a generic one

    // Set the HTTP status code for the response
    res.status(status);

    // Render the error page with relevant information
    res.render('error', {
        status: status, // HTTP status code
        message: message, // Error message
        // You might want to include stack trace only in development environment
        // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        menu: 'error' // Indicate active menu item for layout
    });
};

module.exports = errorHandler;
