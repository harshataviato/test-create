const messageModel = require('../models/MessageModel');

/**
 * HelloController manages the orchestration between the Model and the View.
 */
class HelloController {
  /**
   * Handles the request to the root path.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  renderHelloWorld(req, res) {
    try {
      // Fetch the data from the model
      const message = messageModel.getGreeting();
      
      // Log to console to maintain parity with the original Java functionality
      console.log(message);

      // Render the response using the View template
      res.render('index', { 
        title: 'Google Node Migration',
        message: message 
      });
    } catch (error) {
      // Basic error handling for robustness
      res.status(500).send('Internal Server Error');
    }
  }
}

module.exports = new HelloController();
