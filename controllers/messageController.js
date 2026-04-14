/**
 * @module MessageController
 * @description Controller for handling requests related to messages.
 * It acts as an intermediary between the incoming HTTP request and the data model,
 * then prepares data for the view and renders the appropriate template.
 */

const messageModel = require('../models/messageModel'); // Import the message model to access message data

/**
 * Renders the "Hello world!" page.
 * This function is an Express.js route handler. It fetches the required message
 * from the MessageModel and then passes it to the 'index' view for rendering.
 *
 * @param {Object} req - The Express request object, containing details about the HTTP request.
 * @param {Object} res - The Express response object, used to send back the HTTP response.
 * @returns {void} This function sends an HTTP response and does not return a value.
 */
exports.renderHelloWorld = (req, res) => {
  // Get the "Hello world!" message from our message model
  const message = messageModel.getHelloWorldMessage();

  // Render the 'index' EJS view.
  // The first argument is the name of the template file (without extension, assuming .ejs).
  // The second argument is an object containing data to be passed to the template.
  // Here, we're passing the 'message' variable, which will be accessible as '<%= message %>' in index.ejs.
  res.render('index', { message: message });
};
