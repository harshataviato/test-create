import { HelloWorldModel } from './model';
import { HelloWorldView } from './view';
import { HelloWorldController } from './controller';

/**
 * Main entry point of the Hello World application.
 */
function main(): void {
  // Initialize the model with the "Hello, world!" message.
  const model = new HelloWorldModel("Hello, world!");

  // Initialize the view.
  const view = new HelloWorldView();

  // Initialize the controller with the model and view.
  const controller = new HelloWorldController(model, view);

  // Update the view to display the message.
  controller.updateView();
}

// Call the main function to start the application.
main();
