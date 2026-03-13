/**
 * Model representing the data layer for our greetings.
 * In a real-world scenario, this would interact with a database.
 */
class MessageModel {
  /**
   * Retrieves the greeting message.
   * @returns {string} The classic hello world string.
   */
  static getGreeting() {
    // Logic: Simply returns the hardcoded string as per the original Java requirement
    return "Hello world!";
  }
}

module.exports = MessageModel;
