/**
 * @file src/routes/vet.routes.js
 * @description Defines HTTP routes for veterinarian-related operations.
 * This file is part of the routing layer, specifically for vets.
 */

const express = require('express');
const router = express.Router();
const vetController = require('../controllers/vet.controller');

// Route to display the list of vets in HTML format, with pagination
router.get('/vets.html', vetController.showVetListHtml);

// Route to display the list of vets in JSON format (e.g., for API consumption)
router.get('/', vetController.showResourcesVetListJson);

module.exports = router;
