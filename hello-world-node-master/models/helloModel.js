/**
 * @file helloModel.js
 * @description Model for providing the core "Hello World" data.
 *              In a real application, this would interact with a database or external services.
 */

/**
 * Retrieves the "Hello World" greeting message.
 * This function serves as the data source for our simple application.
 * @returns {string} The "Hello World!" message.
 */
function getMessage() {
  // Return the static "Hello world!" string.
  // This demonstrates how a model would encapsulate data logic.
  return "Hello world!";
}

// Export the function to be accessible by controllers.
module.exports = {
  getMessage,
};
