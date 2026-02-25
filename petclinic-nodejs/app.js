/**
 * @fileoverview Main Express application setup.
 * This file configures the Express server, middleware, routes, and templating engine.
 * It acts as the central point for application initialization.
 */

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const path = require('path');
const i18n = require('./config/i18n'); // Custom i18n configuration
const errorHandler = require('./middleware/errorHandler'); // Custom error handling middleware
const moment = require('moment'); // For date formatting in views

// Import controllers
const welcomeController = require('./controllers/welcomeController');
const crashController = require('./controllers/crashController');
const ownerController = require('./controllers/ownerController');
const petController = require('./controllers/petController');
const visitController = require('./controllers/visitController');
const vetController = require('./controllers/vetController');

const app = express(); // Initialize Express application

// --- View Engine Setup ---
// Configure EJS as the templating engine
app.set('views', path.join(__dirname, 'views')); // Set the directory for view files
app.set('view engine', 'ejs'); // Set EJS as the view engine

// Make moment.js available globally in EJS templates for date formatting
app.locals.moment = moment;

// --- Middleware Setup ---

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
// Serve webjars (e.g., Bootstrap, Font Awesome) from node_modules.
// This mimics the Spring Boot /webjars/ mapping.
app.use('/webjars', express.static(path.join(__dirname, 'node_modules')));

// Parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true }));
// Parse JSON bodies (for API requests, though not heavily used in this app's style)
app.use(express.json());

// Initialize i18n middleware
// This middleware detects the preferred locale and makes translations available
app.use(i18n.init);

// Middleware to expose i18n messages to EJS templates as a global function `__()`
app.use((req, res, next) => {
    // This allows calling e.g. `<%= __('welcome') %>` directly in EJS templates
    res.locals.__ = res.__;
    // Set a default page title if not explicitly set by a controller
    res.locals.layoutTitle = res.__('layoutTitle');
    next();
});

// --- Routes Setup ---

// Root welcome page
app.get('/', welcomeController.welcome);

// Crash controller to demonstrate error handling
app.get('/oups', crashController.triggerException);

// Owner routes
app.get('/owners/new', ownerController.initCreationForm);
app.post('/owners/new', ownerController.processCreationForm);
app.get('/owners/find', ownerController.initFindForm);
app.get('/owners', ownerController.processFindForm);
app.get('/owners/:ownerId/edit', ownerController.initUpdateOwnerForm);
app.post('/owners/:ownerId/edit', ownerController.processUpdateOwnerForm);
app.get('/owners/:ownerId', ownerController.showOwner); // Must be after more specific owner routes

// Pet routes (nested under owners)
app.get('/owners/:ownerId/pets/new', petController.initCreationForm);
app.post('/owners/:ownerId/pets/new', petController.processCreationForm);
app.get('/owners/:ownerId/pets/:petId/edit', petController.initUpdateForm);
app.post('/owners/:ownerId/pets/:petId/edit', petController.processUpdateForm);

// Visit routes (nested under owners and pets)
app.get('/owners/:ownerId/pets/:petId/visits/new', visitController.initNewVisitForm);
app.post('/owners/:ownerId/pets/:petId/visits/new', visitController.processNewVisitForm);

// Vet routes
app.get('/vets.html', vetController.showVetListHtml); // HTML view
app.get('/vets', vetController.showResourcesVetList); // JSON API

// --- Error Handling Middleware ---
// This must be the last middleware added to catch errors from preceding routes.
app.use(errorHandler);

module.exports = app; // Export the configured Express app
