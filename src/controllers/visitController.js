/**
 * @file controllers/visitController.js
 * @description Controller for managing visit-related operations for a specific pet.
 * Handles HTTP requests for creating new visits.
 * Mimics Spring PetClinic's `VisitController.java`.
 */

const ownerService = require('../services/ownerService');
const { validationResult } = require('express-validator');
const Visit = require('../models/visit'); // For creating new instances
const moment = require('moment'); // For date formatting/parsing

/**
 * @middleware loadPetWithVisitMiddleware
 * @description Middleware to load the owner, pet, and (optionally) initialize a new visit.
 * This mimics Spring's `@ModelAttribute("visit")` with `loadPetWithVisit` logic.
 * It expects `req.owner` and `req.pet` to be pre-populated by earlier middleware.
 * It will set `req.visit` and `res.locals.visit`.
 * @param {object} req - Express request object, should have `req.owner` and `req.pet` populated.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
exports.loadPetWithVisitMiddleware = async (req, res, next) => {
  const { owner, pet } = req; // Assumes owner and pet are already attached by previous middleware

  if (!owner || !pet) {
    return next(new Error(req.__('Owner or pet not found for visit operation.')));
  }

  // Ensure owner and pet are available in res.locals for templates
  res.locals.owner = owner;
  res.locals.pet = pet;

  // Create a new Visit instance and associate it with the pet
  // This simulates the `Visit visit = new Visit(); pet.addVisit(visit);` logic
  const visit = new Visit();
  visit.petId = pet.id; // Set foreign key
  // No need to explicitly add to pet.visits array here if it's a new unsaved visit.
  // When saving, we'll use owner.addVisit(petId, visit) which then handles the association.

  req.visit = visit;
  res.locals.visit = visit; // Make visit available in templates

  next();
};

/**
 * @function initNewVisitForm
 * @description Renders the form for adding a new visit to a pet.
 * The owner, pet, and new visit objects are pre-loaded by `loadPetWithVisitMiddleware`.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
exports.initNewVisitForm = (req, res) => {
  res.render('pets/createOrUpdateVisitForm', {
    owner: req.owner,
    pet: req.pet,
    visit: req.visit, // This is a new, empty visit instance
    title: req.__('addVisit')
  });
};

/**
 * @function processNewVisitForm
 * @description Processes the form submission for creating a new visit.
 * Handles validation and saves the new visit to the database.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
exports.processNewVisitForm = async (req, res, next) => {
  const errors = validationResult(req);
  const { owner, pet, visit } = req; // Pre-populated by middleware

  if (!errors.isEmpty()) {
    req.flash('error', errors.array().map(e => req.__(e.msg)).join(', '));
    // Re-render the form with validation errors and submitted data
    return res.render('pets/createOrUpdateVisitForm', {
      owner,
      pet,
      visit: { ...visit.toJSON(), ...req.body, isNew: true }, // Populate form with submitted data
      errors: errors.array(),
      title: req.__('addVisit')
    });
  }

  try {
    // Manually set properties from req.body to the pre-created visit object
    visit.description = req.body.description;
    visit.visitDate = req.body.date ? moment(req.body.date, 'YYYY-MM-DD').toDate() : null; // Ensure it's a Date object

    // Save the visit through the owner service, which handles the association
    await ownerService.addVisitToPet(owner.id, pet.id, visit);
    req.flash('success', req.__('Your visit has been booked'));
    res.redirect(`/owners/${owner.id}`);
  } catch (error) {
    next(error);
  }
};
