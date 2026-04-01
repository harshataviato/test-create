/**
 * @module routes/indexRoutes
 * @description Defines routes for the application's root path and basic pages.
 */

const express = require('express');
const router = express.Router(); // Create a new Express router instance

/**
 * Route for the home page.
 * @name GET /
 * @function
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {void} Renders the 'index' EJS template.
 */
router.get('/', (req, res) => {
  // Render the 'index.ejs' view, which typically serves as the home page.
  // The `title` variable is passed to the template for display in the <title> tag.
  res.render('index', { title: 'Welcome to Product Management' });
});

module.exports = router; // Export the router to be used in app.js
