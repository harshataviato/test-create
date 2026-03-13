const messageModel = require('../models/messageModel');

/**
 * Controller handles the orchestration between the Model and the View.
 */
class HelloController {
  /**
   * GET /
   * Renders the home page with the message from the model.
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  renderHello(req, res) {
    try {
      // Logic: Fetch data from the model layer
      const message = messageModel.getContent();

      // Render the 'index' view and pass the data
      res.render('index', {
        title: 'Google Node Port',
        greeting: message
      });
    } catch (error) {
      // Error handling logic for the controller
      console.error('Error rendering page:', error);
      res.status(500).send('Internal Server Error');
    }
  }
}

module.exports = new HelloController();
