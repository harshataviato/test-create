/**
 * @file homeController.js
 * @description This controller handles requests related to the application's home page.
 * It interacts with the greeting model to retrieve data and renders the appropriate view.
 */

// Import the greeting model to access business logic related to greetings
const greetingModel = require('../models/greetingModel');

/**
 * Renders the home page with a "Hello World" message.
 * This function retrieves the greeting message from the `greetingModel` and then
 * passes it to the `index` EJS template for rendering.
 *
 * @param {object} req - The Express request object, containing information about the HTTP request.
 * @param {object} res - The Express response object, used to send back the HTTP response.
 * @returns {void}
 */
function renderHomePage(req, res) {
  // Retrieve the greeting message from the model.
  // This abstracts away how the greeting is obtained, allowing for easier changes
  // (e.g., fetching from a database, configuration, or external service) later.
  const greeting = greetingModel.getGreeting();

  // Render the 'index' view (index.ejs) and pass the 'greeting' variable to it.
  // The 'index.ejs' template will then use this 'greeting' variable to display the message.
  res.render('index', { greeting: greeting });
}

/**
 * Exports the `renderHomePage` function to make it accessible to other modules,
 * typically the main application file (`app.js`) for routing purposes.
 */
module.exports = {
  renderHomePage,
};
