/**
 * @module helloController
 * @description Controller for handling requests related to the "Hello World" message.
 *              It acts as an intermediary between the model and the view.
 */

const messageModel = require('../models/messageModel');

/**
 * Handles the request to display the "Hello World" message.
 *
 * @function getHelloWorld
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @returns {void} This function sends an HTML response.
 */
function getHelloWorld(req, res) {
  // 1. Get data from the model.
  // The model provides the actual "Hello world!" string.
  const message = messageModel.getHelloWorldMessage();

  // 2. Render the view with the retrieved data.
  // The 'hello' view (hello.ejs) will be rendered, and the 'message'
  // variable will be passed to it for display.
  res.render('hello', { message: message });
}

module.exports = {
  getHelloWorld
};
