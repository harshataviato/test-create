/**
 * App Factory for Testing
 * 
 * Recreates the Express application instance without starting the HTTP server listener.
 * This allows Supertest to bind to an ephemeral port and prevents side-effects
 * from the main app.js execution.
 */
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const i18n = require('../../config/i18n');
const routes = require('../../routes');

const createApp = () => {
  const app = express();

  // Setup View Engine (EJS)
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '../../views'));

  // Middleware
  // Mocking static files serving for tests (not needed for logic tests)
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(i18n.init);

  // Make moments available in views
  app.locals.moment = require('moment');

  // Routes
  app.use('/', routes);

  // 404 Handler
  app.use((req, res, next) => {
    res.status(404).render('error', { message: 'Page Not Found', status: 404 });
  });

  // Global Error Handler
  app.use((err, req, res, next) => {
    // console.error(err); // Squelch for tests
    res.status(500).render('error', { 
      message: err.message || 'Something happened...', 
      status: 500 
    });
  });

  return app;
};

module.exports = createApp;
