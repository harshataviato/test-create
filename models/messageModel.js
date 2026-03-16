/**
 * MessageModel handles the data logic for the application.
 * In a real-world scenario, this might interact with a database.
 */
class MessageModel {
  /**
   * Returns the "Hello World" message.
   * @returns {string} The greeting message.
   */
  static getGreeting() {
    // Business rule: The greeting must always be "Hello world!"
    // consistent with the original Java implementation.
    return "Hello world!";
  }
}

module.exports = MessageModel;
