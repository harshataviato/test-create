/**
 * Represents a greeting message.
 */
export class Greeting {
    /**
     * The message to display.
     */
    message: string;

    /**
     * Creates a new Greeting instance.
     * @param message The greeting message.
     */
    constructor(message: string) {
        this.message = message;
    }

    /**
     * Returns the greeting message.
     * @returns The greeting message.
     */
    getMessage(): string {
        return this.message;
    }
}
