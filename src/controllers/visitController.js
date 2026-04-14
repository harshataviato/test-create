/**
 * @file VisitController module.
 * @description Handles requests related to `Visit` entities, specifically adding new visits for pets.
 * Mirrors Spring's `VisitController.java`.
 * @author Google Senior Engineer
 */

const ownerRepository = require('../repositories/ownerRepository');
const Visit = require('../models/visit');
const { visitValidationRules, validate } = require('../middleware/validation');

// Constants for view names
const VIEWS_CREATE_OR_UPDATE_VISIT_FORM = 'pets/createOrUpdateVisitForm';

/**
 * Middleware to load the pet and owner for a visit form.
 * This mimics Spring's `@ModelAttribute("visit") public Visit loadPetWithVisit(...)`.
 * It ensures that the `Pet` and `Owner` objects are available in `req.locals` for
 * both displaying the form and processing its submission.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @param {string} petId - The pet ID from the URL parameter.
 * @returns {void}
 */
async function loadPetWithVisit(req, res, next, petId) {
  const ownerId = parseInt(req.params.ownerId); // Owner ID from `ownerController.findOwner` param handler
  const owner = req.locals.owner; // Owner object from `ownerController.findOwner` middleware

  if (!owner) {
    const error = new Error(res.__('owner') + ' ' + res.__('notFound'));
    error.statusCode = 404;
    return next(error);
  }

  const pet = owner.getPets().find(p => p.getId() === parseInt(petId));
  if (!pet) {
    const error = new Error(res.__('pet') + ' ' + res.__('notFound'));
    error.statusCode = 404;
    return next(error);
  }

  // Attach pet and owner to locals for views and subsequent middleware
  req.locals.pet = pet;
  res.locals.pet = pet;
  res.locals.owner = owner; // Ensure owner is also in locals for the view

  // Create a new Visit instance and associate it with the pet for the form
  const visit = new Visit();
  req.locals.visit = visit;
  res.locals.visit = visit; // Make it available directly to the view

  // The Java `addVisit` method here just adds to the in-memory collection.
  // The actual database persistence happens on `owners.save(owner)`.
  // We'll mimic this by having the visit linked to the pet in memory for the form flow,
  // and then persist when the form is submitted.

  next();
}


/**
 * Displays the form for creating a new visit.
 * Corresponds to `initNewVisitForm()` in Java.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {void}
 */
function initNewVisitForm(req, res) {
  // `owner`, `pet`, and `visit` are already loaded by `loadPetWithVisit` middleware
  res.render(VIEWS_CREATE_OR_UPDATE_VISIT_FORM, {
    owner: res.locals.owner,
    pet: res.locals.pet,
    visit: res.locals.visit
  });
}

/**
 * Processes the form submission for creating a new visit.
 * Corresponds to `processNewVisitForm()` in Java.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {void}
 */
async function processNewVisitForm(req, res, next) {
  const owner = req.locals.owner;
  const pet = req.locals.pet;
  const petId = parseInt(req.params.petId); // Get petId from route params
  const visitData = req.body;

  try {
    // Create new Visit object from form data
    const visit = new Visit({
      date: visitData.date,
      description: visitData.description
    });

    owner.addVisit(petId, visit); // Add visit to the pet within the owner object
    await ownerRepository.save(owner); // Save the owner, which will cascade the new visit to the database

    req.flash('message', res.__('Your visit has been booked'));
    res.redirect(`/owners/${owner.getId()}`);
  } catch (error) {
    next(error); // Pass database errors to the error handler
  }
}

module.exports = {
  loadPetWithVisit,
  initNewVisitForm,
  processNewVisitForm
};

