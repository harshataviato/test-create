/**
 * @module messageModel
 * @description
 * Model representing the "Hello World" message data.
 * In a more complex application, this would interact with a database or external API.
 */

class MessageModel {
  /**
   * Retrieves the "Hello world!" message.
   * This is a static method, meaning it can be called directly on the class
   * without creating an instance of `MessageModel`.
   *
   * @returns {string} The predefined "Hello world!" message.
   */
  static getHelloWorldMessage() {
    // This is the core data for our "Hello World" application.
    // It's hardcoded here, but could easily be fetched from a database
    // or configuration file in a real-world scenario.
    return "Hello world!";
  }
}

module.exports = MessageModel; // Export the MessageModel class for use in other modules
