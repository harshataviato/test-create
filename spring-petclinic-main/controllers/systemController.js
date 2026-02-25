/**
 * @file systemController.js
 * @description Handles system-level requests such as the welcome page and a crash endpoint.
 * This file replaces the functionality of WelcomeController.java and CrashController.java.
 * @author Google Senior Engineer
 */

const i18n = require('../utils/i18n'); // i18n instance for localized messages

/**
 * @function welcome
 * @description Renders the welcome page of the application.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @returns {void} Renders the 'welcome.ejs' view.
 */
exports.welcome = (req, res) => {
  res.render('welcome');
};

/**
 * @function triggerException
 * @description A handler that deliberately throws a runtime exception to demonstrate error handling.
 * This mimics Spring's CrashController.java.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 * @throws {Error} Throws a generic Error to be caught by the error handling middleware.
 * @returns {void}
 */
exports.triggerException = (req, res, next) => {
  next(new Error(i18n.__('Expected: controller used to showcase what happens when an exception is thrown')));
};
