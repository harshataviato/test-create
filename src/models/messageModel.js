/**
 * MessageModel handles the data logic for our application.
 * In a more complex app, this would interact with a database.
 */
class MessageModel {
  /**
   * Returns the greeting message.
   * Business Rule: The greeting must always be "Hello world!"
   * @returns {string} The core message string
   */
  getContent() {
    return "Hello world!";
  }
}

module.exports = new MessageModel();
