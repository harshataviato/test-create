/**
 * @file helloController.js
 * @description Controller for handling requests related to the 'Hello World' page.
 *              It retrieves data from the model and renders the appropriate view.
 */

// Import the helloModel to access the "Hello World" message data.
const helloModel = require('../models/helloModel');

/**
 * Renders the 'Hello World' page.
 * This function retrieves the greeting message from the model and passes it to the view.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @returns {void}
 */
function getHelloWorldPage(req, res) {
  // Retrieve the message from the helloModel.
  // In a more complex application, this might involve database queries or external API calls.
  const message = helloModel.getMessage();

  // Render the 'hello.ejs' view.
  // The 'message' variable is passed to the view, making it accessible within the template.
  res.render('hello', { message: message });
}

// Export the controller function to be used by routes.
module.exports = {
  getHelloWorldPage,
};

