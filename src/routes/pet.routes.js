/**
 * @file src/routes/pet.routes.js
 * @description Defines HTTP routes for pet-related operations, nested under an owner.
 * This file is part of the routing layer, specifically for pets.
 */

const express = require('express');
const router = express.Router({ mergeParams: true }); // `mergeParams: true` to access parent route params (ownerId)
const petController = require('../controllers/pet.controller');
const { populatePetTypes } = require('../controllers/pet.controller'); // Middleware for pet types

// Middleware to populate pet types for all pet-related forms
router.use(populatePetTypes);

// Route to render the form for creating a new pet
router.get('/new', petController.loadPet, petController.initCreationForm);

// Route to process the creation of a new pet
router.post('/new', petController.processCreationForm); // Pet validation is custom, not express-validator

// Middleware to load pet by ID for routes that require it
router.use('/:petId', petController.loadPet);

// Route to render the form for updating an existing pet
router.get('/:petId/edit', petController.initUpdateForm);

// Route to process the update of an existing pet
router.post('/:petId/edit', petController.processUpdateForm); // Pet validation is custom

module.exports = router;
