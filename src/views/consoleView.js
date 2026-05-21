/**
 * @module consoleView
 * @description
 * This module represents the 'View' component in our MVC architecture.
 * It's responsible for displaying information to the user.
 * In this console-based application, it simply prints messages to the console.
 */

/**
 * Renders a given message to the console.
 * This function acts as the presentation layer, determining how the message
 * is shown to the end-user.
 *
 * @param {string} message - The string message to be displayed.
 * @returns {void} This function does not return any value; its purpose is to
 *                  produce a side effect (printing to the console).
 */
function render(message) {
  // Use console.log to output the message to the standard output.
  // This is the simplest form of a "view" for a console application.
  // In a web application, this might involve rendering an HTML template.
  console.log(message);
}

module.exports = {
  render,
};
