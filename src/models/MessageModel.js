/**
 * MessageModel handles the data logic for the application.
 * In a larger app, this would interface with a database.
 */
class MessageModel {
  /**
   * Returns the "Hello World" greeting logic.
   * @returns {string} The core greeting message.
   */
  getGreeting() {
    // Business logic: returning the specific string required by the legacy Java spec
    return "Hello world!";
  }
}

module.exports = new MessageModel();
