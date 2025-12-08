/**
 * @module app
 * @description Configures and exports the Express application.
 *              Sets up middleware, view engine, static file serving, and routes.
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import path from 'path';
import session from 'express-session';
import i18nextMiddleware from 'i18next-http-middleware';
import { HttpError } from '@utils/errors';
import { initializeI18n } from '@config/i18n';
import routes from '@routes/index';
import { errorHandler } from '@middlewares/errorHandler';
import { localeChangeMiddleware } from '@middlewares/i18nMiddleware';

// Initialize i18n instance
const i18n = initializeI18n();

// Create the Express application instance
const app: Application = express();

/**
 * @function configureApp
 * @description Configures the Express application with various settings and middleware.
 */
function configureApp(): void {
  // Set the view engine to EJS
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '../views')); // Templates are in the 'views' directory

  // Serve static files from the 'public' directory
  app.use(express.static(path.join(__dirname, '../public')));
  // Serve webjars (e.g., Bootstrap, Font Awesome) directly from node_modules
  app.use('/webjars', express.static(path.join(__dirname, '../node_modules/')));

  // Middleware for parsing request bodies
  app.use(express.urlencoded({ extended: true })); // For form submissions
  app.use(express.json()); // For JSON payloads

  // Session middleware configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'supersecret', // Secret for signing the session ID cookie
    resave: false, // Don't save session if unmodified
    saveUninitialized: true, // Save new sessions
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // Session duration: 24 hours
  }));

  // i18next middleware for internationalization
  app.use(i18nextMiddleware.handle(i18n));

  // Custom middleware to handle locale changes via URL parameter (e.g., ?lang=es)
  app.use(localeChangeMiddleware);

  // Expose i18n.t to templates as `__` (similar to Thymeleaf's `#{}`)
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.locals.__ = req.i18n.t;
    // Helper function for Thymeleaf-like temporal formatting
    res.locals.temporals = {
      format: (date: Date | string, formatString: string) => {
        try {
          const moment = require('moment'); // Dynamically import moment here
          return moment(date).format(formatString);
        } catch (e) {
          console.error("Error formatting date:", e);
          return date; // Fallback to raw date if moment fails
        }
      }
    };
    // Helper for string joining (like #strings.listJoin in Thymeleaf)
    res.locals.strings = {
      listJoin: (arr: string[] | undefined, separator: string) => {
        return arr ? arr.join(separator) : '';
      }
    };
    next();
  });

  // Register all application routes
  app.use('/', routes);

  // Global error handler middleware
  app.use(errorHandler);

  // Catch-all for 404 Not Found errors
  app.use((req: Request, res: Response, next: NextFunction) => {
    const err = new HttpError(404, 'The requested page was not found.');
    next(err); // Pass to the error handler
  });
}

// Call the configuration function
configureApp();

export default app;
