/**
 * @module routes/vetRoutes
 * @description Defines the routes for Veterinarian (Vet) listing.
 * Includes pagination and caching for vet data.
 */

const express = require('express');
const router = express.Router();
const vetController = require('../controllers/vetController');

/**
 * GET /vets
 * @summary List all veterinarians
 * @description Retrieves and displays a paginated list of all veterinarians
 * with their associated specialties. Uses caching for performance.
 * @queryParam {number} [page=1] - The page number for pagination.
 */
router.get('/', vetController.listVets);

module.exports = router;
