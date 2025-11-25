/**
 * @module App
 * @description
 * This is the main entry point of the "Hello World" TypeScript application.
 * It initializes the MVC components and orchestrates the application flow.
 */

import { MessageModel } from './models/MessageModel';
import { ConsoleView } from './views/ConsoleView';
import { HelloWorldController } from './controllers/HelloWorldController';

/**
 * Main function to start the "Hello World" application.
 * It sets up the Model, View, and Controller, and then executes the primary logic.
 *
 * @returns {void}
 */
function main(): void {
  console.log("Starting Hello World TypeScript application...");

  // 1. Initialize the Model:
  //    The MessageModel holds the data (in this case, the "Hello world!" string).
  const messageModel = new MessageModel();

  // 2. Initialize the View:
  //    The ConsoleView is responsible for presenting the output to the user (via the console).
  const consoleView = new ConsoleView();

  // 3. Initialize the Controller:
  //    The HelloWorldController acts as the intermediary, connecting the model and the view.
  //    It receives user input (implicit here), retrieves data from the model,
  //    and directs the view to display it.
  const helloWorldController = new HelloWorldController(messageModel, consoleView);

  // 4. Execute the application logic:
  //    Instruct the controller to display the message.
  helloWorldController.displayMessage();

  console.log("Application finished.");

  // --- Example of how a web message might be retrieved (not directly displayed in this console app) ---
  const webMessage: string = helloWorldController.getWebMessage();
  console.log(`\n(For a web context, the message would be: "${webMessage}")`);

  // --- Example of how a web view rendering might be initiated (simulated) ---
  // In a real web server (e.g., Express.js), you'd pass a response object to the controller
  // which would then render an HTML template.
  helloWorldController.renderWebView(consoleView); // Using consoleView as a placeholder for a generic View
}

// Call the main function to start the application.
main();
