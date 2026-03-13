/**
 * Model representing the data for our application.
 * In a real-world scenario, this might interact with a database.
 */
class MessageModel {
  /**
   * Retrieves the hello world greeting.
   * @returns {string} The greeting string.
   */
  static getGreeting() {
    // Business Rule: Return the standard greeting string
    return "Hello world!";
  }
}

module.exports = MessageModel;
