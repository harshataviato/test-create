/**
 * @module HelloWorldController
 * @description
 * Defines the controller for handling "Hello World" requests.
 * It orchestrates interactions between the MessageModel and various views.
 */

import { MessageModel } from '../models/MessageModel';
import { ConsoleView } from '../views/ConsoleView';

/**
 * Interface for a generic View, ensuring that any view used by the controller
 * has a `render` method to display a message.
 */
interface View {
  render(message: string): void;
}

/**
 * The HelloWorldController class manages the application's core logic
 * for displaying the "Hello World" message. It fetches data from the `MessageModel`
 * and sends it to a specified `View` for presentation.
 */
export class HelloWorldController {
  private readonly model: MessageModel;
  private readonly consoleView: ConsoleView; // Specific view for console output

  /**
   * Constructs a new HelloWorldController instance.
   *
   * @param {MessageModel} model - The data model providing the "Hello World" message.
   * @param {ConsoleView} consoleView - The view responsible for rendering output to the console.
   */
  constructor(model: MessageModel, consoleView: ConsoleView) {
    this.model = model;
    this.consoleView = consoleView;
  }

  /**
   * Orchestrates the display of the "Hello World" message to the console.
   * It retrieves the message from the model and passes it to the console view.
   *
   * @returns {void}
   */
  public displayMessage(): void {
    const message: string = this.model.getMessage(); // Fetch message from the model
    this.consoleView.render(message); // Render the message using the console view
  }

  /**
   * Retrieves the "Hello World" message directly, often used for web API endpoints
   * where the controller might return data directly to a client, rather than
   * rendering it through a specific view.
   *
   * @returns {string} The "Hello world!" message.
   */
  public getWebMessage(): string {
    return this.model.getMessage();
  }

  /**
   * Example method for a hypothetical web server scenario.
   * In a real web application, this method would render an HTML template
   * with the message. For this example, it simulates that by logging,
   * but the actual HTML template `helloWorld.html` is provided separately.
   *
   * @param {View} webView - A hypothetical web view instance (e.g., an Express.js response object or a templating engine).
   * @returns {void}
   */
  public renderWebView(webView: View): void {
    const message: string = this.model.getMessage();
    // In a real web application, `webView.render` might actually render an EJS/Handlebars template
    // and send it as an HTTP response.
    // For this console-based example, we'll just log that it would be rendered.
    console.log(`(Simulating web view rendering) Message for web: "${message}". Check src/views/helloWorld.html for template.`);
    // Example of how a web view might be implemented if this were an Express.js app:
    // res.render('helloWorld', { message: message });
  }
}
