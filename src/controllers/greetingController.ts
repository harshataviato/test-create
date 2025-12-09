import { Greeting } from '../models/Greeting';
import { GreetingView } from '../views/greetingView';
import { Request, Response } from 'express';

/**
 * Handles requests related to greeting messages.
 */
export class GreetingController {
    /**
     * Handles the request to display the greeting.
     * @param req The Express request object.
     * @param res The Express response object.
     */
    getGreeting(req: Request, res: Response): void {
        // 1. Create a Greeting model instance.
        const greetingModel = new Greeting("Hello, World!");

        // 2. Get the message from the model.
        const message = greetingModel.getMessage();

        // 3. Create a GreetingView instance.
        const greetingView = new GreetingView();

        // 4. Render the message using the view.
        const renderedMessage = greetingView.render(message);

        // 5. Send the rendered message as the response.
        res.send(renderedMessage);
    }
}
