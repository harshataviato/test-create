/**
 * @module MessageModel
 * @description Handles data related to messages, specifically providing the "Hello world!" message.
 * In a more complex application, this module would interact with a database or external services
 * to fetch or manipulate data. For this simple case, it directly provides the message.
 */

/**
 * Retrieves the default "Hello world!" message.
 * This function simulates fetching data from a data source.
 *
 * @returns {string} The "Hello world!" message string.
 */
exports.getHelloWorldMessage = () => {
  return "Hello world!";
};
