/**
 * @module app
 * @description
 * Configures and initializes the Express.js application, including middleware,
 * view engine, static file serving, internationalization, and route registration.
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import session from 'express-session';
import i18nMiddleware from './middleware/i18n.middleware';
import { notFoundHandler, errorHandler } from './middleware/error.middleware';
import { Constants } from './utils/constants';

// Import routers
import welcomeRouter from './controllers/system/welcome.controller';
import crashRouter from './controllers/system/crash.controller';
import vetRouter from './controllers/vet/vet.controller';
import ownerRouter from './controllers/owner/owner.controller';
import petRouter from './controllers/owner/pet.controller';
import visitRouter from './controllers/owner/visit.controller';

export const app: Express = express();

// --- Express Configuration ---

// Set EJS as the view engine
app.set('view engine', 'ejs');
// Specify the directory where EJS templates are located
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));
// Serve webjars (e.g., Bootstrap, Font Awesome) from node_modules
app.use('/webjars', express.static(path.join(__dirname, '../node_modules')));

// Parse URL-encoded bodies (for form submissions)
app.use(bodyParser.urlencoded({ extended: true }));
// Parse JSON bodies
app.use(bodyParser.json());

// Configure session middleware (needed for i18n and potentially other features)
app.use(session({
  secret: process.env.SESSION_SECRET || 'a_very_secret_key', // Use a strong secret in production
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' } // Use secure cookies in production
}));

// Internationalization middleware
app.use(i18nMiddleware);

// Middleware to expose session messages to views
app.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.message = req.session.message;
  res.locals.error = req.session.error;
  delete req.session.message;
  delete req.session.error;
  next();
});

// --- Route Definitions ---

// System controllers
app.use('/', welcomeRouter);
app.use('/', crashRouter); // Crash controller for testing error handling

// Vet controllers
app.use('/', vetRouter);

// Owner, Pet, and Visit controllers
app.use('/owners', ownerRouter);
app.use('/owners/:ownerId/pets', petRouter);
app.use('/owners/:ownerId/pets/:petId/visits', visitRouter);


// --- Error Handling Middleware ---

// Handle 404 Not Found errors
app.use(notFoundHandler);
// General error handling middleware
app.use(errorHandler);
