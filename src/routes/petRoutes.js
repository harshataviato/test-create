/**
 * @file routes/petRoutes.js
 * @description Defines the Express routes for pet-related operations within a specific owner context.
 * These routes are nested under `/owners/:ownerId/pets`.
 */

const express = require('express');
const router = express.Router({ mergeParams: true }); // `mergeParams: true` to access :ownerId
const petController = require('../controllers/petController');
const ownerController = require('../controllers/ownerController'); // To reuse owner middleware
const { validatePet } = require('../utils/validators'); // Import pet validation middleware

/**
 * Middleware to load the owner and pet objects based on URL parameters.
 * This simulates Spring's `@ModelAttribute` for `Owner` and `Pet`.
 */
router.use(ownerController.findOwnerMiddleware); // Load owner based on :ownerId

/**
 * Route: /owners/:ownerId/pets/new
 * GET: Displays the form for adding a new pet to the current owner.
 */
router.get('/new', petController.initCreationForm);

/**
 * Route: /owners/:ownerId/pets/new
 * POST: Processes the form submission for adding a new pet.
 * Uses `validatePet` middleware for server-side validation.
 */
router.post('/new', validatePet(), petController.processCreationForm);

/**
 * Middleware to load the pet object based on :petId.
 * This should run after `findOwnerMiddleware` as it depends on `req.owner`.
 */
router.param('petId', petController.findPetMiddleware); // Load pet based on :petId

/**
 * Route: /owners/:ownerId/pets/:petId/edit
 * GET: Displays the form for updating an existing pet.
 */
router.get('/:petId/edit', petController.initUpdateForm);

/**
 * Route: /owners/:ownerId/pets/:petId/edit
 * POST: Processes the form submission for updating an existing pet.
 * Uses `validatePet` middleware for validation.
 */
router.post('/:petId/edit', validatePet(), petController.processUpdateForm);

module.exports = router;
