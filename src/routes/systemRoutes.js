/**
 * @file routes/systemRoutes.js
 * @description Defines general system routes like welcome page and crash test.
 */

const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');

/**
 * Route: /
 * GET: Displays the welcome page.
 */
router.get('/', systemController.welcome);

/**
 * Route: /oups
 * GET: Triggers a runtime exception to demonstrate error handling.
 */
router.get('/oups', systemController.triggerException);

module.exports = router;
