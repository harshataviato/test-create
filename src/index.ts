import { Message } from "./model/Message";
import { MessageView } from "./view/MessageView";
import { MessageController } from "./controller/MessageController";

/**
 * Main entry point of the application.
 */
function main(): void {
  // Create a new Message object with the content "Hello, World!".
  const message = new Message("Hello, World!");

  // Create a new MessageView object.
  const view = new MessageView();

  // Create a new MessageController object, passing in the message and view.
  const controller = new MessageController(message, view);

  // Display the message using the controller.
  controller.displayMessage();
}

// Call the main function to start the application.
main();
