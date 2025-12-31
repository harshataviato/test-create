/**
 * @module routes/errorRoutes
 * @description Defines the route for simulating runtime errors.
 */

const express = require('express');
const router = express.Router();
const errorController = require('../controllers/errorController');

/**
 * GET /oups
 * @summary Simulate an error
 * @description This endpoint intentionally throws a runtime error to demonstrate
 * the application's error handling pages.
 */
router.get('/', errorController.triggerError);

module.exports = router;
