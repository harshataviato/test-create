/**
 * @file src/controllers/system.controller.js
 * @description Handles system-related HTTP requests, such as error triggering and welcome page.
 * This file replaces `CrashController.java` and `WelcomeController.java`.
 */

/**
 * @function triggerException
 * @description Triggers a runtime exception to showcase error handling.
 * Mimics `@GetMapping("/oups")` from `CrashController.java`.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function.
 * @throws {Error} An intentional runtime exception.
 */
function triggerException(req, res, next) {
  const error = new Error(res.__('Expected: controller used to showcase what happens when an exception is thrown'));
  error.status = 500;
  next(error); // Pass the error to Express's error handling middleware
}

/**
 * @function welcome
 * @description Renders the welcome page of the application.
 * Mimics `@GetMapping("/")` from `WelcomeController.java`.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
function welcome(req, res) {
  res.render('welcome', { title: res.__('welcome') });
}

module.exports = {
  triggerException,
  welcome,
};
