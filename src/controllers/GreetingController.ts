import { Greeting } from '../models/Greeting';

/**
 * Handles the creation and management of greeting messages.
 */
export class GreetingController {
  /**
   * Creates a new GreetingController instance.
   */
  constructor() {}

  /**
   * Creates a new greeting message.
   * @param name The name to include in the greeting.
   * @returns A Greeting object with the personalized greeting.
   */
  createGreeting(name: string = "World"): Greeting {
    const message = `Hello, ${name}!`;
    return new Greeting(message);
  }
}
