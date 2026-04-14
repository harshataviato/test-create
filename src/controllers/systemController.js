/**
 * @file controllers/systemController.js
 * @description Controller for general system routes like welcome page and crash test.
 */

/**
 * @function welcome
 * @description Renders the welcome page.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
exports.welcome = (req, res) => {
  res.render('welcome', { title: req.__('welcome') });
};

/**
 * @function triggerException
 * @description Triggers a runtime exception to demonstrate error handling.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
exports.triggerException = (req, res, next) => {
  // Simulate an error by throwing one, which will be caught by the global error handler
  const error = new Error(req.__('Expected: controller used to showcase what happens when an exception is thrown'));
  error.status = 500; // Indicate server error
  next(error);
};
