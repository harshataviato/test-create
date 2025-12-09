/**
 * Represents the data model for the Hello World application.
 */
export class HelloWorldModel {
  /**
   * The message to be displayed.
   */
  private message: string;

  /**
   * Creates a new HelloWorldModel instance.
   * @param message The message to be stored.
   */
  constructor(message: string) {
    this.message = message;
  }

  /**
   * Gets the message.
   * @returns The message.
   */
  getMessage(): string {
    return this.message;
  }

  /**
   * Sets the message.
   * @param message The new message.
   */
  setMessage(message: string): void {
    this.message = message;
  }
}
