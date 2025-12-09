/**
 * Represents a greeting message.
 */
export class Greeting {
  /**
   * Creates a new Greeting instance.
   * @param message The greeting message.
   */
  constructor(public message: string) {}

  /**
   * Returns the greeting message.
   * @returns The greeting message.
   */
  getMessage(): string {
    return this.message;
  }
}
