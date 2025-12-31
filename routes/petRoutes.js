/**
 * @module routes/petRoutes
 * @description Defines the routes for Pet management, nested under Owner routes.
 * Includes routes for adding and editing pets.
 */

const express = require('express');
const router = express.Router({ mergeParams: true }); // `mergeParams: true` allows access to parent route params (ownerId)
const petController = require('../controllers/petController');
const { validatePet } = require('../middleware/petValidator');

/**
 * GET /owners/:ownerId/pets/new
 * @summary Show new pet form
 * @param {number} ownerId - The ID of the owner to whom the pet will be added.
 * @description Renders the form to add a new pet for a specific owner.
 */
router.get('/new', petController.showCreatePetForm);

/**
 * POST /owners/:ownerId/pets/new
 * @summary Process new pet form
 * @param {number} ownerId - The ID of the owner to whom the pet will be added.
 * @description Handles the submission of the new pet form. Validates input and
 * creates a new pet record associated with the specified owner.
 */
router.post('/new', validatePet(), petController.processCreatePetForm);

/**
 * GET /owners/:ownerId/pets/:petId/edit
 * @summary Show edit pet form
 * @param {number} ownerId - The ID of the owner who owns the pet.
 * @param {number} petId - The ID of the pet to edit.
 * @description Renders the form to modify an existing pet's details.
 */
router.get('/:petId/edit', petController.showUpdatePetForm);

/**
 * POST /owners/:ownerId/pets/:petId/edit
 * @summary Process edit pet form
 * @param {number} ownerId - The ID of the owner who owns the pet.
 * @param {number} petId - The ID of the pet to update.
 * @description Handles the submission of the edit pet form. Validates input and
 * updates the existing pet record.
 */
router.post('/:petId/edit', validatePet(), petController.processUpdatePetForm);

module.exports = router;
