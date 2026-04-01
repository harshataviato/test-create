/**
 * @file src/routes/index.js
 * @description Main router for the PetClinic application.
 * This file centralizes all route definitions and their corresponding controllers.
 * It's analogous to how Spring MVC maps controllers to URLs.
 */

const express = require('express');
const router = express.Router();

const ownerRoutes = require('./owner.routes');
const petRoutes = require('./pet.routes');
const visitRoutes = require('./visit.routes');
const vetRoutes = require('./vet.routes');
const systemController = require('../controllers/system.controller');
const i18n = require('../config/i18n'); // For handling locale changes

// Middleware to set global flash messages if present in session
// This mimics Spring's RedirectAttributes.addFlashAttribute behavior.
router.use((req, res, next) => {
  if (req.session && req.session.flash) {
    res.locals.flash = req.session.flash;
    delete req.session.flash; // Clear flash messages after consumption
  }
  next();
});

// Middleware to store flash messages for redirects
router.use((req, res, next) => {
  // Override res.redirect to include flash messages
  const originalRedirect = res.redirect;
  res.redirect = function(url) {
    if (req.flash) {
      req.session.flash = req.flash;
    }
    originalRedirect.call(this, url);
  };
  next();
});

// Global locale change handler
router.get('/?lang', (req, res, next) => {
  if (req.query.lang && i18n.getLocales().includes(req.query.lang)) {
    i18n.setLocale(req, req.query.lang);
    req.session.locale = req.query.lang;
  }
  next();
});


// System routes
router.get('/', systemController.welcome);
router.get('/oups', systemController.triggerException); // Route to trigger an error

// Mount specific feature routes
router.use('/owners', ownerRoutes);
router.use('/owners/:ownerId/pets', petRoutes); // Pet routes are nested under owner
router.use('/owners/:ownerId/pets/:petId/visits', visitRoutes); // Visit routes are nested under pet
router.use('/vets', vetRoutes); // Vet routes handle both HTML and JSON requests

module.exports = router;
