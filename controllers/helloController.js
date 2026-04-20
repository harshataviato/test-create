const HelloModel = require('../models/helloModel');

/**
 * Controller handling requests for the Hello World logic.
 */
class HelloController {
  /**
   * Renders the hello world view.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  static renderHello(req, res) {
    try {
      // Fetch the data from the model
      const message = HelloModel.getGreeting();
      
      // Pass the data to the view engine
      res.render('index', { message });
    } catch (error) {
      console.error("Error in helloController:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  /**
   * API endpoint returning the message as JSON.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  static getHelloJson(req, res) {
    const message = HelloModel.getGreeting();
    res.json({ message });
  }
}

module.exports = HelloController;
