import { GreetingController } from './controllers/GreetingController';
import { GreetingView } from './views/GreetingView';

/**
 * Main entry point of the application.
 */
function main(): void {
  // Create a new greeting controller.
  const controller = new GreetingController();

  // Create a greeting message.
  const greeting = controller.createGreeting();

  // Create a greeting view.
  const view = new GreetingView();

  // Display the greeting message.
  view.displayGreeting(greeting);
}

// Run the main function.
main();
