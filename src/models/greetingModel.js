/**
 * @module greetingModel
 * @description
 * This module represents the 'Model' component in our MVC architecture.
 * It's responsible for managing the data or business logic related to the greeting message.
 * In this simple case, it just provides the static "Hello world!" string.
 */

/**
 * Retrieves the standard greeting message.
 *
 * @returns {string} The greeting message "Hello world!".
 */
function getGreeting() {
  // This is the core data or content for our application.
  // In a more complex application, this might involve fetching data from a database,
  // performing calculations, or interacting with other services.
  return "Hello world!";
}

module.exports = {
  getGreeting,
};
