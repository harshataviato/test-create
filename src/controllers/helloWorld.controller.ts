/**
 * @module HelloWorldController
 * @description
 * Defines the controller for the "Hello World" application.
 * This controller orchestrates the interaction between the MessageModel and the ConsoleView.
 */

import { MessageModel } from '../models/message.model'; // Import the MessageModel to fetch data
import { renderMessage } from '../views/console.view';   // Import the renderMessage view function to display data

/**
 * The HelloWorldController class is responsible for handling the logic
 * to retrieve the "Hello World!" message and display it.
 * It acts as the intermediary between the data (model) and the presentation (view).
 */
export class HelloWorldController {
  private messageModel: MessageModel;

  /**
   * Constructs a new HelloWorldController instance.
   * Initializes the MessageModel, which provides the data.
   */
  constructor() {
    this.messageModel = new MessageModel();
  }

  /**
   * Initiates the process of displaying "Hello World!".
   * It retrieves the message from the model and then passes it to the view for rendering.
   *
   * @returns {void}
   */
  public displayHelloWorld(): void {
    // 1. Get the message data from the model.
    // This simulates fetching data from a data source.
    const message = this.messageModel.getMessage();

    // 2. Render the message using the view.
    // The controller decides *what* to display and *how* to display it
    // by delegating to the appropriate view function.
    renderMessage(message);
  }
}
