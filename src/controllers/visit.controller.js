/**
 * @file src/controllers/visit.controller.js
 * @description Handles HTTP requests related to pet visits.
 * This file replaces `VisitController.java`.
 */

const ownerService = require('../services/owner.service');
const visitService = require('../services/visit.service');
const visitValidator = require('../validators/visit.validator');
const { validationResult } = require('express-validator');

const VIEWS_PETS_CREATE_OR_UPDATE_VISIT_FORM = 'pets/createOrUpdateVisitForm';

/**
 * @function loadPetWithVisit
 * @description Middleware to load owner, pet, and initialize a new visit for the pet.
 * This mimics Spring's `@ModelAttribute("visit")` with owner and pet path variables.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function.
 */
async function loadPetWithVisit(req, res, next) {
  const ownerId = parseInt(req.params.ownerId, 10);
  const petId = parseInt(req.params.petId, 10);

  try {
    const owner = await ownerService.getOwnerById(ownerId);
    if (!owner) {
      const err = new Error(res.__('notFound', { entity: 'Owner' }));
      err.status = 404;
      return next(err);
    }

    const pet = owner.getPet(petId);
    if (!pet) {
      const err = new Error(res.__('notFound', { entity: 'Pet' }));
      err.status = 404;
      return next(err);
    }

    // Initialize a new visit object
    const newVisit = { date: new Date().toISOString().slice(0, 10), description: '', isNew: () => true };
    // `pet.addVisit` here is for in-memory structure consistency for rendering, actual db add done on owner.addVisit
    pet.addVisit(newVisit);

    res.locals.owner = owner;
    res.locals.pet = pet;
    res.locals.visit = newVisit; // For the form, represents a new visit

    next();
  } catch (error) {
    console.error('Error loading pet with visit:', error);
    next(error);
  }
}

/**
 * @function initNewVisitForm
 * @description Renders the form for creating a new visit.
 * Mimics `@GetMapping("/owners/{ownerId}/pets/{petId}/visits/new")`.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
function initNewVisitForm(req, res) {
  // `res.locals.owner`, `res.locals.pet`, `res.locals.visit` are available from middleware
  res.render(VIEWS_PETS_CREATE_OR_UPDATE_VISIT_FORM, {
    owner: res.locals.owner,
    pet: res.locals.pet,
    visit: res.locals.visit,
  });
}

/**
 * @async @function processNewVisitForm
 * @description Processes the form submission for creating a new visit.
 * Mimics `@PostMapping("/owners/{ownerId}/pets/{petId}/visits/new")`.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function.
 */
async function processNewVisitForm(req, res, next) {
  const owner = res.locals.owner;
  const pet = res.locals.pet;
  const petId = parseInt(req.params.petId, 10);
  const errors = validationResult(req);

  // Custom visit validation logic
  const visitValidationErrors = visitValidator.validate(req.body, res.__);
  if (visitValidationErrors.length > 0) {
    const allErrors = errors.array().concat(visitValidationErrors);
    req.flash = { error: res.__('error', { context: 'booking your visit' }) };
    return res.render(VIEWS_PETS_CREATE_OR_UPDATE_VISIT_FORM, {
      owner: owner,
      pet: pet,
      visit: { ...req.body, isNew: () => true }, // Re-populate form with submitted data
      errors: allErrors,
      flash: req.flash
    });
  }

  try {
    const newVisitData = { ...req.body, pet_id: petId };

    // The addVisit method on the owner instance handles persistence of the visit.
    await owner.addVisit(petId, newVisitData);

    req.flash = { message: res.__('Your visit has been booked') };
    res.redirect(`/owners/${owner.id}`);
  } catch (error) {
    console.error('Error processing new visit form:', error);
    req.flash = { error: res.__('error', { context: 'booking your visit' }) };
    return res.render(VIEWS_PETS_CREATE_OR_UPDATE_VISIT_FORM, {
      owner: owner,
      pet: pet,
      visit: { ...req.body, isNew: () => true },
      flash: req.flash
    });
  }
}

module.exports = {
  loadPetWithVisit,
  initNewVisitForm,
  processNewVisitForm,
};
