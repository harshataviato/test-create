/**
 * @file greetingModel.js
 * @description This model provides the core "Hello World" message for the application.
 * In a more complex application, this model would interact with a database or
 * external data sources. For this simple case, it directly provides the string.
 */

/**
 * Retrieves the standard "Hello world!" greeting message.
 * This function encapsulates the data source for the greeting. If the greeting
 * needed to be dynamic, localized, or fetched from a database, the logic
 * would reside here, keeping the controller clean.
 *
 * @returns {string} The "Hello world!" string.
 */
function getGreeting() {
  // This is the core business logic of this very simple model:
  // providing the greeting message.
  return "Hello world!";
}

/**
 * Exports the `getGreeting` function to make it available to other modules,
 * such as controllers that need to display the greeting.
 */
module.exports = {
  getGreeting,
};
