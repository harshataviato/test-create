const express = require('express');
const router = express.Router();
const startupController = require('../controllers/StartupController');

/**
 * Route Mapping
 */

// Dashboard - View all
router.get('/', startupController.getAllStartups);

// Form to add new
router.get('/new', startupController.getCreateForm);

// POST request to create
router.post('/startups', startupController.createStartup);

// DELETE request to remove (using method-override for HTML forms)
router.post('/startups/delete/:id', startupController.deleteStartup);

module.exports = router;
