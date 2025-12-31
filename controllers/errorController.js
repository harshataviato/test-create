/**
 * @module controllers/errorController
 * @description Controller for simulating and handling error scenarios.
 */

/**
 * @function triggerError
 * @description Triggers a deliberate runtime error to demonstrate error handling.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @throws {Error} Always throws an error with a specific message.
 */
exports.triggerError = (req, res, next) => {
  // Simulate an error by throwing a new Error
  throw new Error(res.__('error.simulationMessage')); // Use i18n for error message
};
