import { HelloWorldModel } from './model';
import { HelloWorldView } from './view';

/**
 * Represents the controller for the Hello World application.
 * Handles the interaction between the model and the view.
 */
export class HelloWorldController {
  private model: HelloWorldModel;
  private view: HelloWorldView;

  /**
   * Creates a new HelloWorldController instance.
   * @param model The model.
   * @param view The view.
   */
  constructor(model: HelloWorldModel, view: HelloWorldView) {
    this.model = model;
    this.view = view;
  }

  /**
   * Updates the view with the message from the model.
   */
  updateView(): void {
    this.view.displayMessage(this.model.getMessage());
  }

    /**
     * Sets the message in the model.
     * @param message The message to set.
     */
    setMessage(message: string): void {
        this.model.setMessage(message);
        this.updateView(); // Update the view after setting the message.
    }
}
