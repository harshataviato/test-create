/**
 * Main Router
 * Aggregates all specific controller routes.
 */
const express = require('express');
const router = express.Router();

const welcomeController = require('../controllers/welcomeController');
const crashController = require('../controllers/crashController');
const ownerRoutes = require('./ownerRoutes'); // Specific sub-router for owners
const vetController = require('../controllers/vetController');

// Home Page
router.get('/', welcomeController.welcome);

// Crash Demo
router.get('/oups', crashController.triggerException);

// Vets
router.get('/vets.html', vetController.showVetList);
router.get('/vets', vetController.showResourcesVetList); // JSON API

// Owner Routes (delegated to sub-router for cleaner file)
router.use('/owners', require('./ownerRoutes'));

module.exports = router;
