/**
 * HelloWorldModel handles data logic for the application.
 * In a real-world scenario, this would interact with a database.
 */
class HelloWorldModel {
  /**
   * Fetches the greeting message.
   * @returns {Object} An object containing the greeting string.
   */
  static getGreeting() {
    // Logic to encapsulate the business rule for the "Hello World" string
    return {
      message: "Hello world!",
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = HelloWorldModel;
