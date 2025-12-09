import express, { Express, Request, Response } from 'express';
import { GreetingController } from './controllers/greetingController';

/**
 * Main application entry point.  Sets up the Express server and routes.
 */
const app: Express = express();
const port = 3000;

// Create a new instance of the GreetingController.
const greetingController = new GreetingController();

// Define a route for the greeting.  When a request is made to the root path ("/"),
// the getGreeting method of the greetingController will be called.
app.get('/', (req: Request, res: Response) => {
    greetingController.getGreeting(req, res);
});

// Start the server and listen for incoming requests.
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
