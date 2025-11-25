/**
 * @module ConsoleView
 * @description
 * Defines a view responsible for rendering messages to the console.
 * This view is designed for command-line interface (CLI) applications.
 */

/**
 * The ConsoleView class handles displaying messages directly to the console.
 * It implements a simple rendering mechanism for textual output.
 */
export class ConsoleView {
  /**
   * Displays a given message string to the console.
   * This method is the primary way this view communicates output to the user.
   *
   * @param {string} message - The string message to be displayed.
   * @returns {void}
   */
  public render(message: string): void {
    console.log(message);
  }
}
