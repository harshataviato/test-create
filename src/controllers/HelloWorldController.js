const HelloWorldModel = require('../models/HelloWorldModel');

/**
 * HelloWorldController manages the flow between the Model and the View.
 */
class HelloWorldController {
  /**
   * Handles the GET request for the homepage.
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static index(req, res) {
    try {
      // 1. Fetch data from the Model
      const data = HelloWorldModel.getGreeting();

      // 2. Pass the data to the View (EJS template)
      res.render('index', { 
        title: 'Google Senior Engineer Implementation',
        greeting: data.message,
        time: data.timestamp
      });
    } catch (error) {
      // Basic error handling for edge cases
      console.error("Controller Error:", error);
      res.status(500).send("Internal Server Error");
    }
  }
}

module.exports = HelloWorldController;
