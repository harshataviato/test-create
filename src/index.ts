/**
 * @module MainApplication
 * @description
 * This is the main entry point of the Hello World TypeScript application.
 * It initializes the HelloWorldController and triggers the display of the message.
 */

import { HelloWorldController } from './controllers/helloWorld.controller'; // Import the main application controller

/**
 * The main function to start the Hello World application.
 * It instantiates the HelloWorldController and calls its method
 * to display the "Hello World!" message.
 *
 * @returns {void}
 */
function main(): void {
  // Create an instance of the HelloWorldController.
  // The controller will then manage fetching the message and displaying it.
  const helloWorldApp = new HelloWorldController();

  // Call the displayHelloWorld method on the controller to execute the application's core logic.
  helloWorldApp.displayHelloWorld();
}

// Execute the main function to start the application.
// This is the common pattern for console applications in Node.js.
main();
