/**
 * @module helloController
 * @description
 * Controller for handling requests related to the "Hello World" message.
 * It interacts with the `MessageModel` to retrieve data and renders the appropriate view.
 */

const MessageModel = require('../models/messageModel'); // Import the MessageModel

/**
 * Renders the "Hello world!" message on the home page.
 * This function acts as an Express.js route handler.
 *
 * @param {object} req - The Express request object.
 *   Contains information about the HTTP request, such as headers, query parameters, etc.
 * @param {object} res - The Express response object.
 *   Used to send HTTP responses back to the client, e.g., rendering views or sending JSON.
 * @returns {void}
 */
exports.getHomePage = (req, res) => {
  // Retrieve the "Hello world!" message from the MessageModel.
  // This abstracts the data source, even if it's currently hardcoded.
  const message = MessageModel.getHelloWorldMessage();

  // Render the 'index' EJS template.
  // The `message` variable is passed to the template, making it accessible as `<%= message %>`.
  res.render('index', { message: message });
};
