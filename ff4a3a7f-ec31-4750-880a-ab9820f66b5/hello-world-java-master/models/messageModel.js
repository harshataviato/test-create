/**
 * @module messageModel
 * @description Represents the data model for the "Hello World" message.
 *              In a more complex application, this would interact with a database
 *              or external service to fetch data. For this simple example,
 *              it merely provides a static string.
 */

/**
 * @class MessageModel
 * @description Provides methods to retrieve messages.
 */
class MessageModel {
  /**
   * Retrieves the standard "Hello World" message.
   *
   * @returns {string} The "Hello World!" string.
   */
  getHelloWorldMessage() {
    return "Hello world!";
  }
}

// Export an instance of the MessageModel so it can be used throughout the application.
module.exports = new MessageModel();
