/**
 * @module MessageModel
 * @description
 * Defines the data model for messages in the application.
 * This model is responsible for providing the core message data.
 */

/**
 * Represents the data model for a message.
 * It encapsulates the logic for retrieving the application's primary message.
 */
export class MessageModel {
  private readonly _message: string;

  /**
   * Constructs a new MessageModel instance.
   * Initializes the default message.
   */
  constructor() {
    // The core message data provided by this model.
    this._message = "Hello world!";
  }

  /**
   * Retrieves the message stored within the model.
   * This method acts as the getter for the message data.
   * @returns {string} The "Hello world!" message.
   */
  public getMessage(): string {
    return this._message;
  }
}
