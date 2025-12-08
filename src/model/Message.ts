/**
 * Represents a simple message model.
 */
export class Message {
  /**
   * The content of the message.
   */
  public content: string;

  /**
   * Creates a new Message instance.
   * @param content The message content.
   */
  constructor(content: string) {
    this.content = content;
  }

  /**
   * Gets the message content.
   * @returns The message content.
   */
  getContent(): string {
    return this.content;
  }
}
