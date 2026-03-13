const MessageModel = require('../models/messageModel');

/**
 * Controller handling the logic for the greeting routes.
 * Acts as the glue between the MessageModel and the View.
 */
class HelloController {
  /**
   * Handles the request for the home page.
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static index(req, res) {
    try {
      // Fetch data from the model
      const message = MessageModel.getGreeting();

      // Log to console to mimic the original Java System.out.println behavior
      console.log(message);

      // Render the view with the retrieved message
      res.render('index', { message });
    } catch (error) {
      // Edge case: Handle potential rendering or logic errors
      res.status(500).send("Internal Server Error");
    }
  }
}

module.exports = HelloController;
