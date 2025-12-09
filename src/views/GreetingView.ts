import { Greeting } from '../models/Greeting';

/**
 * Displays the greeting message to the user.  Currently, it logs to the console.
 */
export class GreetingView {
  /**
   * Displays the greeting message.
   * @param greeting The Greeting object to display.
   */
  displayGreeting(greeting: Greeting): void {
    console.log(greeting.getMessage());
  }
}
