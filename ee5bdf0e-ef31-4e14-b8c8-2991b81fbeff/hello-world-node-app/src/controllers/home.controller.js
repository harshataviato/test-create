/**
 * @module homeController
 * @description
 * This module defines the controller functions responsible for handling requests
 * related to the home page of the application.
 * It interacts with the `messageModel` to fetch data and renders the appropriate view.
 */

const messageModel = require('../models/message.model'); // Import the message model to get data

/**
 * @function getHomePage
 * @param {object} req - The Express request object. Contains information about the HTTP request.
 * @param {object} res - The Express response object. Used to send responses back to the client.
 * @returns {void} This function sends an HTML response and does not return a value.
 * @description
 * Handles GET requests to the home page (e.g., '/').
 * It fetches the "Hello world!" message from the `messageModel`
 * and then renders the `index.ejs` view, passing the message to it.
 */
function getHomePage(req, res) {
  // Retrieve the "Hello world!" message from the model.
  // This separates the data retrieval logic from the presentation logic.
  const helloMessage = messageModel.getHelloWorldMessage();

  // Render the 'index.ejs' view.
  // The 'message' property is passed to the view, which will then display it.
  res.render('index', { message: helloMessage });
}

// Export the controller functions to be used by the router.
module.exports = {
  getHomePage,
};
