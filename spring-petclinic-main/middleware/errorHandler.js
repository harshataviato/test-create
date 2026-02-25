/**
 * @file errorHandler.js
 * @description Express error handling middleware.
 * This middleware centralizes error handling for the application,
 * rendering a custom error page with relevant details.
 * It replaces the default Spring Boot error handling for specific error pages.
 * @param {Error} err - The error object passed by `next(err)`.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function (not used here as this is a terminal error handler).
 * @author Google Senior Engineer
 */

const i18n = require('../utils/i18n'); // i18n instance for localized messages

const errorHandler = (err, req, res, next) => {
  console.error('Application Error:', err); // Log the error for debugging

  // Determine HTTP status code
  let status = err.status || 500;
  if (err.name === 'SequelizeUniqueConstraintError') {
    status = 409; // Conflict
  } else if (err.name === 'SequelizeValidationError') {
    status = 400; // Bad Request
  } else if (err.message && err.message.includes('not found')) {
    status = 404; // Not Found for specific resource access errors
  }

  // Set the response status code
  res.status(status);

  // Prepare error details for the view
  const errorMessage = err.message || i18n.__('error.general');
  let viewMessage;

  switch (status) {
    case 404:
      viewMessage = i18n.__('error.404');
      break;
    case 500:
      viewMessage = i18n.__('error.500');
      break;
    default:
      viewMessage = i18n.__('error.general');
      break;
  }

  // Render the custom error page.
  // The `error.ejs` view expects `status` and `message` variables.
  res.render('error', {
    status: status,
    message: viewMessage,
    detailedMessage: errorMessage, // Provide more detailed message for development/debugging
    // Make `menu` available to layout.ejs, as it's typically set by a global middleware
    menu: 'error'
  });
};

module.exports = errorHandler;
