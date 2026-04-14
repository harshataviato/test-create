/**
 * @file routes/visitRoutes.js
 * @description Defines the Express routes for visit-related operations within a specific owner and pet context.
 * These routes are nested under `/owners/:ownerId/pets/:petId/visits`.
 */

const express = require('express');
const router = express.Router({ mergeParams: true }); // `mergeParams: true` to access :ownerId and :petId
const visitController = require('../controllers/visitController');
const ownerController = require('../controllers/ownerController'); // For shared owner/pet loading middleware
const petController = require('../controllers/petController'); // For shared owner/pet loading middleware
const { validateVisit } = require('../utils/validators'); // Import visit validation middleware

/**
 * Middleware to load the owner and pet objects based on URL parameters.
 * This simulates Spring's `@ModelAttribute` for `Owner` and `Pet`.
 * `loadPetWithVisitMiddleware` essentially replaces Spring's `loadPetWithVisit` by populating
 * `res.locals.owner` and `res.locals.pet`, and creating a new `Visit` if applicable.
 */
router.use(ownerController.findOwnerMiddleware); // Load owner based on :ownerId
router.use(petController.findPetMiddleware); // Load pet based on :petId
router.use(visitController.loadPetWithVisitMiddleware); // Load pet and possibly create new visit

/**
 * Route: /owners/:ownerId/pets/:petId/visits/new
 * GET: Displays the form for adding a new visit to the specified pet.
 */
router.get('/new', visitController.initNewVisitForm);

/**
 * Route: /owners/:ownerId/pets/:petId/visits/new
 * POST: Processes the form submission for adding a new visit.
 * Uses `validateVisit` middleware for server-side validation.
 */
router.post('/new', validateVisit(), visitController.processNewVisitForm);

module.exports = router;
