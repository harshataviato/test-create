/**
 * @module indexRoutes
 * @description
 * This module defines the routes for the root URL ('/') of the application.
 * It uses Express Router to map specific HTTP methods and paths to controller functions.
 */

const express = require('express');       // Import Express to create a router
const router = express.Router();          // Create a new router instance
const homeController = require('../controllers/home.controller'); // Import the home controller

/**
 * @description
 * Defines a GET route for the root path '/'.
 * When a GET request is made to '/', the `getHomePage` function from `homeController`
 * will be executed to handle the request.
 *
 * Route: GET /
 * Handler: homeController.getHomePage
 */
router.get('/', homeController.getHomePage);

// Export the router to be used by the main application (server.js)
module.exports = router;
