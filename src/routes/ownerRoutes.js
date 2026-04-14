/**
 * @file routes/ownerRoutes.js
 * @description Defines the Express routes for owner-related operations.
 * Maps URL paths to controller methods for creating, finding, updating, and displaying owners.
 */

const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');
const { validateOwner } = require('../utils/validators'); // Import owner validation middleware

/**
 * Route: /owners/new
 * GET: Displays the form for creating a new owner.
 */
router.get('/new', ownerController.initCreationForm);

/**
 * Route: /owners/new
 * POST: Processes the form submission for creating a new owner.
 * Uses `validateOwner` middleware to perform server-side validation.
 */
router.post('/new', validateOwner(), ownerController.processCreationForm);

/**
 * Route: /owners/find
 * GET: Displays the form for finding owners by last name.
 */
router.get('/find', ownerController.initFindForm);

/**
 * Route: /owners
 * GET: Processes the search for owners by last name (or all if last name is empty).
 * Handles pagination and redirects to owner details if only one owner is found.
 */
router.get('/', ownerController.processFindForm);

/**
 * Route: /owners/:ownerId/edit
 * GET: Displays the form for updating an existing owner.
 * `:ownerId` is a URL parameter representing the owner's ID.
 * This route also uses `ownerController.findOwnerMiddleware` to preload the owner object.
 */
router.get('/:ownerId/edit', ownerController.findOwnerMiddleware, ownerController.initUpdateOwnerForm);

/**
 * Route: /owners/:ownerId/edit
 * POST: Processes the form submission for updating an existing owner.
 * Uses `validateOwner` middleware for validation.
 * `:ownerId` is a URL parameter representing the owner's ID.
 * This route also uses `ownerController.findOwnerMiddleware` to preload the owner object.
 */
router.post('/:ownerId/edit', ownerController.findOwnerMiddleware, validateOwner(), ownerController.processUpdateOwnerForm);

/**
 * Route: /owners/:ownerId
 * GET: Displays the details of a single owner, including their pets and visits.
 * `:ownerId` is a URL parameter representing the owner's ID.
 */
router.get('/:ownerId', ownerController.showOwner);

module.exports = router;
