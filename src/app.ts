/**
 * @module app
 * @description Main Express application setup.
 * Configures middleware, view engine, static assets, session management, and routes.
 */

import express from 'express';
import path from 'path';
import session from 'express-session';
import flash from 'connect-flash';
import i18n from 'i18n';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Import route modules
import ownerRoutes from '@controllers/ownerController';
import petRoutes from '@controllers/petController';
import visitRoutes from '@controllers/visitController';
import vetRoutes from '@controllers/vetController';
import systemRoutes from '@controllers/systemController';
import { i18nConfig } from '@config/i18n';

// Initialize Express app
const app = express();

/**
 * @constant {string} VIEWS_PATH
 * @description Absolute path to the views directory for EJS templates.
 */
const VIEWS_PATH = path.join(__dirname, '../views');

/**
 * @constant {string} PUBLIC_PATH
 * @description Absolute path to the public directory for static assets.
 */
const PUBLIC_PATH = path.join(__dirname, '../public');

// --- Middleware Configuration ---

// Setup EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', VIEWS_PATH);

// Serve static files from the 'public' directory
app.use(express.static(PUBLIC_PATH));

// Parse URL-encoded bodies (for form data)
app.use(express.urlencoded({ extended: true }));
// Parse JSON bodies (if needed for API endpoints, though not primary for PetClinic)
app.use(express.json());

// Configure express-session for session management
// Required for connect-flash to work
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'superSecretKey', // Secret key to sign the session ID cookie
    resave: false, // Don't save session if unmodified
    saveUninitialized: true, // Save new sessions
    cookie: { maxAge: 60 * 60 * 1000 }, // 1 hour
  })
);

// Configure connect-flash for flash messages
// Must be used after express-session
app.use(flash());

// Custom middleware to make flash messages available to all templates
// 'success' and 'error' are common flash message types
app.use((req, res, next) => {
  res.locals.message = req.flash('message'); // General messages
  res.locals.error = req.flash('error');     // Error messages
  next();
});

// Configure i18n
i18n.configure(i18nConfig);
app.use(i18n.init); // Initialize i18n for each request

// Custom middleware to make i18n __() function available in templates
// Also sets the active menu item for layout.ejs
app.use((req, res, next) => {
  res.locals.__ = i18n.__.bind(req); // Bind i18n's __ function to request for use in templates
  res.locals.getLocale = i18n.getLocale.bind(req); // Bind getLocale for current request's locale
  next();
});

// --- Route Definitions ---

/**
 * @description Registers system-related routes (e.g., welcome, error).
 */
app.use('/', systemRoutes);

/**
 * @description Registers owner-related routes.
 */
app.use('/owners', ownerRoutes);

/**
 * @description Registers pet-related routes, nested under owner routes.
 */
app.use('/owners/:ownerId/pets', petRoutes);

/**
 * @description Registers visit-related routes, nested under pet routes.
 */
app.use('/owners/:ownerId/pets/:petId/visits', visitRoutes);

/**
 * @description Registers veterinarian-related routes.
 */
app.use('/vets', vetRoutes);

// --- Error Handling Middleware ---

/**
 * @description Catch-all error handler for unexpected errors.
 * Logs the error and renders a generic error page.
 */
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack); // Log the error stack for debugging
  res.status(500).render('error', {
    status: 500,
    message: err.message, // Pass error message to the template
    // The following are usually suppressed in production for security
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    menu: 'error'
  });
});

/**
 * @description Catch-all for 404 Not Found errors.
 * Renders a specific 404 error page.
 */
app.use((req: express.Request, res: express.Response) => {
  res.status(404).render('error', {
    status: 404,
    message: 'The requested page was not found.',
    menu: 'error'
  });
});

export default app;
