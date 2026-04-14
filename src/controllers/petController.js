/**
 * @file PetController module.
 * @description Handles requests related to `Pet` entities, specifically within the context of an `Owner`.
 * This includes creating, updating, and displaying forms for pets.
 * Mirrors Spring's `PetController.java`.
 * @author Google Senior Engineer
 */

const ownerRepository = require('../repositories/ownerRepository');
const petTypeRepository = require('../repositories/petTypeRepository');
const Owner = require('../models/owner');
const Pet = require('../models/pet');
const PetType = require('../models/petType');
const { petValidationRules, validate } = require('../middleware/validation');

// Constants for view names
const VIEWS_PETS_CREATE_OR_UPDATE_FORM = 'pets/createOrUpdatePetForm';

/**
 * Middleware to populate all `PetType`s for selection in pet forms.
 * This mimics Spring's `@ModelAttribute("types") public Collection<PetType> populatePetTypes()`.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {void}
 */
async function populatePetTypes(req, res, next) {
  try {
    const petTypes = await petTypeRepository.findPetTypes();
    res.locals.types = petTypes; // Make types available in the view
    next();
  } catch (error) {
    next(error); // Pass any database errors to the error handler
  }
}

/**
 * Middleware to find a `Pet` by ID within a specific `Owner` and attach it to `req.locals.pet`.
 * This mimics Spring's `@ModelAttribute("pet") public Pet findPet(...)`.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @param {string} petId - The pet ID from the URL parameter.
 * @returns {void}
 */
async function findPet(req, res, next, petId) {
  const ownerId = parseInt(req.params.ownerId); // Owner ID is already available from previous middleware (ownerController.findOwner)
  const owner = req.locals.owner; // Owner object from ownerController.findOwner middleware

  if (petId) {
    // If petId is provided, try to find the existing pet
    const pet = owner.getPets().find(p => p.getId() === parseInt(petId));
    if (!pet) {
      const error = new Error(`Pet with id ${petId} not found for owner with id ${ownerId}.`);
      error.statusCode = 404;
      return next(error);
    }
    req.locals.pet = pet;
    res.locals.pet = pet; // Make pet available in the view
  } else {
    // If no petId, it's a new pet scenario
    req.locals.pet = new Pet();
    res.locals.pet = new Pet();
  }
  next();
}

/**
 * Displays the form for creating a new pet.
 * Corresponds to `initCreationForm()` in Java.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {void}
 */
function initCreationForm(req, res) {
  const owner = req.locals.owner;
  const pet = req.locals.pet; // This is a new Pet() object from findPet middleware
  owner.addPet(pet); // Associate the new pet with the owner for form submission structure
  res.render(VIEWS_PETS_CREATE_OR_UPDATE_FORM, { owner, pet, types: res.locals.types });
}

/**
 * Processes the form submission for creating a new pet.
 * Corresponds to `processCreationForm()` in Java.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {void}
 */
async function processCreationForm(req, res, next) {
  const owner = req.locals.owner;
  const petData = req.body;

  try {
    const petType = await petTypeRepository.findByName(petData.type);
    if (!petType) {
      // This case should ideally be caught by express-validator if 'type' is required and invalid.
      // But adding a robust check here in case.
      res.locals.errors = { type: [res.__('type') + ' ' + res.__('notFound')] };
      return res.render(VIEWS_PETS_CREATE_OR_UPDATE_FORM, { owner, pet: new Pet(petData), types: res.locals.types });
    }

    const pet = new Pet({
      name: petData.name,
      birthDate: petData.birthDate,
      type: petType // Use the PetType object from DB
    });

    owner.addPet(pet); // Add the new pet instance to the owner
    await ownerRepository.save(owner); // Save the owner, which cascades to new pets/visits

    req.flash('message', res.__('New Pet has been Added'));
    res.redirect(`/owners/${owner.getId()}`);
  } catch (error) {
    next(error); // Pass database errors to the error handler
  }
}

/**
 * Displays the form for updating an existing pet.
 * Corresponds to `initUpdateForm()` in Java.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {void}
 */
function initUpdateForm(req, res) {
  const owner = req.locals.owner;
  const pet = req.locals.pet; // Pet object from findPet middleware
  res.render(VIEWS_PETS_CREATE_OR_UPDATE_FORM, { owner, pet, types: res.locals.types });
}

/**
 * Processes the form submission for updating an existing pet.
 * Corresponds to `processUpdateForm()` in Java.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {void}
 */
async function processUpdateForm(req, res, next) {
  const owner = req.locals.owner;
  const petId = parseInt(req.params.petId);
  const petData = req.body;

  try {
    const petType = await petTypeRepository.findByName(petData.type);
    if (!petType) {
      res.locals.errors = { type: [res.__('type') + ' ' + res.__('notFound')] };
      return res.render(VIEWS_PETS_CREATE_OR_UPDATE_FORM, { owner, pet: new Pet({ ...petData, id: petId }), types: res.locals.types });
    }

    const existingPet = owner.getPets().find(p => p.getId() === petId);

    if (!existingPet) {
      const error = new Error(`Pet with id ${petId} not found for owner with id ${owner.getId()}.`);
      error.statusCode = 404;
      return next(error);
    }

    // Update existing pet's properties
    existingPet.setName(petData.name);
    existingPet.setBirthDate(petData.birthDate);
    existingPet.setType(petType);

    await ownerRepository.save(owner); // Save the owner, which cascades to updated pets

    req.flash('message', res.__('Pet details has been edited'));
    res.redirect(`/owners/${owner.getId()}`);
  } catch (error) {
    next(error); // Pass database errors to the error handler
  }
}

module.exports = {
  populatePetTypes,
  findPet,
  initCreationForm,
  processCreationForm,
  initUpdateForm,
  processUpdateForm
};
