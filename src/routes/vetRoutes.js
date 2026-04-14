/**
 * @file routes/vetRoutes.js
 * @description Defines the Express routes for veterinarian-related operations.
 */

const express = require('express');
const router = express.Router();
const vetController = require('../controllers/vetController');

/**
 * Route: /vets.html
 * GET: Displays a paginated list of veterinarians in HTML format.
 * Expects a `page` query parameter (defaulting to 1).
 */
router.get('/vets.html', vetController.showVetListHtml);

/**
 * Route: /vets (API endpoint)
 * GET: Returns a list of all veterinarians in JSON format.
 */
router.get('/', vetController.showResourcesVetList);

module.exports = router;
