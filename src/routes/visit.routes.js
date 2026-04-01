/**
 * @file src/routes/visit.routes.js
 * @description Defines HTTP routes for visit-related operations, nested under an owner and pet.
 * This file is part of the routing layer, specifically for visits.
 */

const express = require('express');
const router = express.Router({ mergeParams: true }); // `mergeParams: true` to access parent route params (ownerId, petId)
const visitController = require('../controllers/visit.controller');

// Middleware to load owner, pet, and initialize a new visit for the form
router.use('/new', visitController.loadPetWithVisit);

// Route to render the form for creating a new visit
router.get('/new', visitController.initNewVisitForm);

// Route to process the creation of a new visit
router.post('/new', visitController.processNewVisitForm); // Visit validation is custom, not express-validator

// No explicit routes for editing/deleting visits in the original UI, so not implemented here.

module.exports = router;
