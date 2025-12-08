/**
 * Represents a view for displaying a Message.
 */
export class MessageView {
  /**
   * Displays the message content to the console.
   * @param message The Message object to display.
   */
  display(message: { getContent: () => string }): void {
    console.log(message.getContent());
  }
}
