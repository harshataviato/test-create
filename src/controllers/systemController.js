/**
 * @file SystemController module.
 * @description Handles general system-related requests such as the welcome page and a crash endpoint.
 * Mirrors Spring's `WelcomeController.java` and `CrashController.java`.
 * @author Google Senior Engineer
 */

/**
 * Displays the welcome page.
 * Corresponds to `WelcomeController.welcome()` in Java.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {void}
 */
function welcome(req, res) {
  res.render('welcome', { menu: 'home' }); // Render the welcome view, setting 'home' as active menu
}

/**
 * Triggers a runtime exception to showcase error handling.
 * Corresponds to `CrashController.triggerException()` in Java.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @throws {Error} A `RuntimeException` equivalent with a specific message.
 */
function triggerException(req, res, next) {
  // In Node.js, we throw a standard Error object. Express's error handling middleware will catch it.
  const error = new Error("Expected: controller used to showcase what happens when an exception is thrown");
  error.statusCode = 500; // Indicate an internal server error
  next(error); // Pass the error to the next error handling middleware
}

module.exports = {
  welcome,
  triggerException
};
