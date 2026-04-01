/**
 * @file src/routes/owner.routes.js
 * @description Defines HTTP routes for owner-related operations.
 * This file is part of the routing layer, specifically for owners.
 */

const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/owner.controller');
const ownerValidator = require('../validators/owner.validator'); // For express-validator

// Route to render the form for finding owners
router.get('/find', ownerController.initFindForm);

// Route to process finding owners (can redirect to details or show list)
router.get('/', ownerController.processFindForm);

// Route to render the form for creating a new owner
router.get('/new', ownerController.loadOwner, ownerController.initCreationForm);

// Route to process the creation of a new owner
router.post('/new', ownerValidator, ownerController.processCreationForm);

// Middleware to load owner by ID for routes that require it
// This is typically placed before specific ID-dependent routes
router.use('/:ownerId', ownerController.loadOwner);

// Route to render the form for updating an existing owner
router.get('/:ownerId/edit', ownerController.initUpdateOwnerForm);

// Route to process the update of an existing owner
router.post('/:ownerId/edit', ownerValidator, ownerController.processUpdateOwnerForm);

// Route to display an owner's details
router.get('/:ownerId', ownerController.showOwner);


module.exports = router;
