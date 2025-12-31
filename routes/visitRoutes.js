/**
 * @module routes/visitRoutes
 * @description Defines the routes for Pet Visit management, nested under Pet routes.
 * Includes routes for adding new visits.
 */

const express = require('express');
const router = express.Router({ mergeParams: true }); // `mergeParams: true` allows access to parent route params (ownerId, petId)
const visitController = require('../controllers/visitController');
const { validateVisit } = require('../middleware/visitValidator');

/**
 * GET /owners/:ownerId/pets/:petId/visits/new
 * @summary Show new visit form
 * @param {number} ownerId - The ID of the owner of the pet.
 * @param {number} petId - The ID of the pet for which to record a visit.
 * @description Renders the form to add a new visit for a specific pet.
 */
router.get('/new', visitController.showCreateVisitForm);

/**
 * POST /owners/:ownerId/pets/:petId/visits/new
 * @summary Process new visit form
 * @param {number} ownerId - The ID of the owner of the pet.
 * @param {number} petId - The ID of the pet for which to record a visit.
 * @description Handles the submission of the new visit form. Validates input and
 * creates a new visit record associated with the specified pet.
 */
router.post('/new', validateVisit(), visitController.processCreateVisitForm);

module.exports = router;
