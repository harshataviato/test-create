/**
 * @module MessageModel
 * @description
 * Defines the data model for a simple message.
 * This model holds the actual content of the "Hello World!" message.
 */

/**
 * Represents the data model for a message.
 * In a more complex application, this might interact with a database
 * or an external service to fetch data. For this simple example,
 * it directly provides the message content.
 */
export class MessageModel {
  private readonly messageContent: string;

  /**
   * Constructs a new MessageModel instance.
   * Initializes the message content.
   */
  constructor() {
    // In a real application, this content might be loaded from a config, DB, or API.
    this.messageContent = "Hello World!";
  }

  /**
   * Retrieves the message content stored in the model.
   *
   * @returns {string} The "Hello World!" message string.
   */
  public getMessage(): string {
    return this.messageContent;
  }
}
