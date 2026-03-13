const MessageModel = require('../models/messageModel');

/**
 * Controller handles the incoming web requests and coordinates 
 * between the Model and the View.
 */
const helloController = {
  /**
   * Handles the root GET request.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  index: (req, res) => {
    try {
      // Fetch data from the model
      const message = MessageModel.getGreeting();

      // Log the message to console to match the original Java functionality
      console.log(message);

      // Render the view with the data
      res.render('index', { message });
    } catch (error) {
      // Basic error handling for robustness
      res.status(500).send("Internal Server Error");
    }
  }
};

module.exports = helloController;
