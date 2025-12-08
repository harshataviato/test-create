import { Message } from "../model/Message";
import { MessageView } from "../view/MessageView";

/**
 * Controller for handling messages.
 */
export class MessageController {
  private message: Message;
  private view: MessageView;

  /**
   * Creates a new MessageController instance.
   * @param message The Message object to control.
   * @param view The MessageView object to use for displaying the message.
   */
  constructor(message: Message, view: MessageView) {
    this.message = message;
    this.view = view;
  }

  /**
   * Displays the message using the view.
   */
  displayMessage(): void {
    this.view.display(this.message);
  }
}
