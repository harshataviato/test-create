/**
 * @module routes/homeRoutes
 * @description Defines the route for the application's home page.
 */

const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

/**
 * GET /
 * @summary Home page
 * @description Renders the main welcome page of the application.
 */
router.get('/', homeController.renderHomePage);

module.exports = router;
