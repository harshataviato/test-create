/**
 * @file index.js
 * @description Defines the main application routes.
 *              This module maps URL paths to controller functions.
 */

// Import the Express router to define routes.
const express = require('express');
// Create a new router instance.
const router = express.Router();
// Import the helloController to handle the logic for the "Hello World" page.
const helloController = require('../controllers/helloController');

/**
 * Route for the home page.
 * Handles GET requests to the root URL ("/").
 * It uses the `getHelloWorldPage` function from `helloController` to process the request
 * and render the appropriate view.
 */
router.get('/', helloController.getHelloWorldPage);

// Export the router to be used by the main application file (app.js).
module.exports = router;
