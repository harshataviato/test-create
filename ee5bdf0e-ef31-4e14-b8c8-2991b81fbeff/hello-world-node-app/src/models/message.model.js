/**
 * @module messageModel
 * @description
 * This module represents the "Model" layer for our simple "Hello World" application.
 * In a more complex application, this would interact with a database or other data sources.
 * For this example, it simply provides a static string message.
 */

/**
 * @function getHelloWorldMessage
 * @returns {string} The "Hello world!" message.
 * @description
 * Retrieves the core "Hello world!" message.
 * This function encapsulates the data, making it easy to change the message
 * or fetch it from a different source later without affecting other layers.
 */
function getHelloWorldMessage() {
  return "Hello world!";
}

// Export the function to make it available for other modules (e.g., controllers)
module.exports = {
  getHelloWorldMessage,
};
