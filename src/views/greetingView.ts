/**
 * Renders the greeting message to HTML.
 */
export class GreetingView {
    /**
     * Renders the greeting message within an HTML element.
     * @param message The greeting message to render.
     * @returns An HTML string containing the formatted greeting.
     */
    render(message: string): string {
        return `<h1>${message}</h1>`; // Basic HTML rendering
    }
}
