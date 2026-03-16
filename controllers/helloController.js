const MessageModel = require('../models/messageModel');

/**
 * HelloController handles incoming HTTP requests and bridges the 
 * Model and View layers.
 */
class HelloController {
  /**
   * Handles the GET request for the homepage.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  static index(req, res) {
    try {
      // Retrieve data from the model
      const message = MessageModel.getGreeting();

      // Log to console to mimic the original Java System.out.println
      console.log(message);

      // Render the view with the data
      res.render('index', { message });
    } catch (error) {
      // Basic error handling for robustness
      res.status(500).send('Internal Server Error');
    }
  }
}

module.exports = HelloController;
