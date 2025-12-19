/**
 * @module ConsoleView
 * @description
 * Defines the view layer responsible for displaying messages to the console.
 * This acts as a simple template for rendering output.
 */

/**
 * Renders a given message string to the console.
 * This function represents our 'view template' for a console application.
 * In a web application, this would be a UI component or a templating engine.
 *
 * @param {string} message - The string message to be displayed.
 * @returns {void}
 */
export function renderMessage(message: string): void {
  // Use console.log to output the message, as this is a console-based application.
  console.log(message);
}
