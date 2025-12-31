/**
 * @module routes/ownerRoutes
 * @description Defines the routes for Owner management.
 * Includes routes for searching, viewing details, creating, and updating owners.
 */

const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');
const { validateOwner } = require('../middleware/ownerValidator');

/**
 * GET /owners/find
 * @summary Show owner search form
 * @description Renders the form to search for owners by last name.
 */
router.get('/find', ownerController.showFindOwnerForm);

/**
 * GET /owners
 * @summary Process owner search or list all owners
 * @description Handles the submission of the owner search form. If a last name is provided,
 * it searches for matching owners. If no last name, it lists all owners.
 * If exactly one owner is found, it redirects to their detail page.
 */
router.get('/', ownerController.processFindOwnerForm);

/**
 * GET /owners/new
 * @summary Show new owner form
 * @description Renders the form to create a new owner profile.
 */
router.get('/new', ownerController.showCreateOwnerForm);

/**
 * POST /owners/new
 * @summary Process new owner form
 * @description Handles the submission of the new owner form. Validates input and
 * creates a new owner record in the database.
 */
router.post('/new', validateOwner(), ownerController.processCreateOwnerForm);

/**
 * GET /owners/:ownerId
 * @summary Show owner details
 * @param {number} ownerId - The ID of the owner to view.
 * @description Displays detailed information for a specific owner, including their pets and visits.
 */
router.get('/:ownerId', ownerController.showOwnerDetails);

/**
 * GET /owners/:ownerId/edit
 * @summary Show edit owner form
 * @param {number} ownerId - The ID of the owner to edit.
 * @description Renders the form to update an existing owner's details.
 */
router.get('/:ownerId/edit', ownerController.showUpdateOwnerForm);

/**
 * POST /owners/:ownerId/edit
 * @summary Process edit owner form
 * @param {number} ownerId - The ID of the owner to update.
 * @description Handles the submission of the edit owner form. Validates input and
 * updates the existing owner record in the database.
 */
router.post('/:ownerId/edit', validateOwner(), ownerController.processUpdateOwnerForm);

module.exports = router;
