/**
 * @module app
 * @description
 * This is the main entry point for the Node.js application.
 * It's responsible for initializing and starting the application flow.
 * In an MVC pattern, this file typically sets up the environment and
 * calls the primary controller to handle the initial request or action.
 */

// Import the main controller responsible for our greeting logic.
const greetingController = require('./controllers/greetingController');

/**
 * The main function that starts the application.
 * This immediately calls the displayGreeting function from our controller
 * to produce the "Hello world!" output.
 * @returns {void}
 */
function main() {
  // Call the controller to initiate the display of the greeting.
  // This is where our application's execution begins.
  console.log("Application started..."); // Optional: A simple startup message.
  greetingController.displayGreeting();
  console.log("Application finished."); // Optional: A simple shutdown message.
}

// Execute the main function when the script is run.
main();
