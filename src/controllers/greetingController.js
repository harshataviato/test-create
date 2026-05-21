/**
 * @module greetingController
 * @description
 * This module represents the 'Controller' component in our MVC architecture.
 * It acts as an intermediary between the Model and the View, handling user input
 * (or initiating application flow in this case) and updating both the Model and View.
 */

// Import the Model to get the data (greeting message).
const greetingModel = require('../models/greetingModel');
// Import the View to display the data.
const consoleView = require('../views/consoleView');

/**
 * Orchestrates the process of getting the greeting message and displaying it.
 * This function initiates the application's core logic by:
 * 1. Fetching the data from the model.
 * 2. Passing the data to the view for display.
 *
 * @returns {void} This function does not return any value. It orchestrates
 *                  the interaction between the model and the view.
 */
function displayGreeting() {
  // Step 1: Get the greeting message from the model.
  // The controller asks the model for the data it needs.
  const message = greetingModel.getGreeting();

  // Step 2: Pass the message to the view for rendering.
  // The controller tells the view what to display.
  consoleView.render(message);
}

module.exports = {
  displayGreeting,
};
