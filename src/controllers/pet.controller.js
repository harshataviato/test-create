/**
 * @file src/controllers/pet.controller.js
 * @description Handles HTTP requests related to pet management for a specific owner.
 * This file replaces `PetController.java`.
 */

const ownerService = require('../services/owner.service');
const petService = require('../services/pet.service');
const petValidator = require('../validators/pet.validator');
const { validationResult } = require('express-validator');

const VIEWS_PETS_CREATE_OR_UPDATE_FORM = 'pets/createOrUpdatePetForm';

/**
 * @function populatePetTypes
 * @description Middleware to populate pet types for forms.
 * Mimics Spring's `@ModelAttribute("types")`.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function.
 */
async function populatePetTypes(req, res, next) {
  try {
    const petTypes = await petService.getAllPetTypes();
    res.locals.types = petTypes; // Attach types to response locals
    next();
  } catch (error) {
    console.error('Error populating pet types:', error);
    next(error); // Pass any errors to the error handling middleware
  }
}

/**
 * @function loadPet
 * @description Middleware to load a pet object based on `petId` for a given `ownerId`.
 * If `petId` is present, fetches the pet from the owner's pets.
 * If `petId` is not present, initializes a new Pet object.
 * Attaches the pet to `res.locals` for use in subsequent middleware/templates.
 *
 * This mimics Spring's `@ModelAttribute("pet")`.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function.
 */
async function loadPet(req, res, next) {
  const owner = res.locals.owner; // Owner should already be loaded by owner.controller.loadOwner
  const petId = parseInt(req.params.petId, 10);

  if (!owner) {
    const err = new Error(res.__('Owner not found'));
    err.status = 404;
    return next(err);
  }

  if (isNaN(petId)) {
    // If petId is not a number, it means we are creating a new pet
    const newPet = { isNew: () => true };
    owner.addPet(newPet); // Associate new pet with owner in-memory
    res.locals.pet = newPet;
    next();
    return;
  }

  try {
    // Find pet within the owner's loaded pets
    const pet = owner.getPet(petId);
    if (!pet) {
      const err = new Error(res.__('notFound', { entity: 'Pet' }));
      err.status = 404;
      return next(err);
    }
    res.locals.pet = pet; // Attach pet to response locals
    next();
  } catch (error) {
    console.error('Error loading pet:', error);
    next(error);
  }
}

/**
 * @function initCreationForm
 * @description Renders the form for creating a new pet.
 * Mimics `@GetMapping("/owners/{ownerId}/pets/new")`.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
function initCreationForm(req, res) {
  // `res.locals.owner` and `res.locals.pet` (new pet) are available from middleware
  res.render(VIEWS_PETS_CREATE_OR_UPDATE_FORM, {
    owner: res.locals.owner,
    pet: res.locals.pet,
    types: res.locals.types,
  });
}

/**
 * @async @function processCreationForm
 * @description Processes the form submission for creating a new pet.
 * Mimics `@PostMapping("/owners/{ownerId}/pets/new")`.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function.
 */
async function processCreationForm(req, res, next) {
  const owner = res.locals.owner;
  const errors = validationResult(req);

  // Custom pet validation, similar to Java's PetValidator and business logic
  const petValidationErrors = petValidator.validate(req.body, owner, res.__);
  if (petValidationErrors.length > 0) {
    const allErrors = errors.array().concat(petValidationErrors);
    req.flash = { error: res.__('error', { context: 'adding the pet' }) };
    return res.render(VIEWS_PETS_CREATE_OR_UPDATE_FORM, {
      owner: owner,
      pet: { ...req.body, isNew: () => true }, // Re-populate form with submitted data
      types: res.locals.types,
      errors: allErrors,
      flash: req.flash
    });
  }

  try {
    // Create new pet instance
    const newPetData = { ...req.body, type_id: req.body.type };
    const newPet = await petService.createPet(owner.id, newPetData); // This builds a pet instance for validation
    
    // Set type association for in-memory object (will be handled by owner.save for persistence)
    newPet.type = res.locals.types.find(t => t.id == newPetData.type_id);

    owner.addPet(newPet); // Add the new pet to the owner's in-memory list
    await ownerService.updateOwner(owner.id, owner.dataValues); // Save the owner (which cascades to pets)
    req.flash = { message: res.__('New Pet has been Added') };
    res.redirect(`/owners/${owner.id}`);
  } catch (error) {
    console.error('Error creating pet:', error);
    req.flash = { error: res.__('error', { context: 'adding the pet' }) };
    return res.render(VIEWS_PETS_CREATE_OR_UPDATE_FORM, {
      owner: owner,
      pet: { ...req.body, isNew: () => true },
      types: res.locals.types,
      flash: req.flash
    });
  }
}

/**
 * @function initUpdateForm
 * @description Renders the form for updating an existing pet.
 * Mimics `@GetMapping("/owners/{ownerId}/pets/{petId}/edit")`.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
function initUpdateForm(req, res) {
  // `res.locals.owner`, `res.locals.pet`, `res.locals.types` are available from middleware
  res.render(VIEWS_PETS_CREATE_OR_UPDATE_FORM, {
    owner: res.locals.owner,
    pet: res.locals.pet,
    types: res.locals.types,
  });
}

/**
 * @async @function processUpdateForm
 * @description Processes the form submission for updating an existing pet.
 * Mimics `@PostMapping("/owners/{ownerId}/pets/{petId}/edit")`.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function.
 */
async function processUpdateForm(req, res, next) {
  const owner = res.locals.owner;
  const petId = parseInt(req.params.petId, 10);
  const errors = validationResult(req);

  // Custom pet validation, similar to Java's PetValidator and business logic
  const petValidationErrors = petValidator.validate({ ...req.body, id: petId }, owner, res.__);
  if (petValidationErrors.length > 0) {
    const allErrors = errors.array().concat(petValidationErrors);
    req.flash = { error: res.__('error', { context: 'editing the pet' }) };
    return res.render(VIEWS_PETS_CREATE_OR_UPDATE_FORM, {
      owner: owner,
      pet: { ...req.body, id: petId, isNew: () => false }, // Re-populate form with submitted data
      types: res.locals.types,
      errors: allErrors,
      flash: req.flash
    });
  }

  try {
    const updatedPetData = { ...req.body, type_id: req.body.type }; // Assuming req.body.type is the ID
    const updatedPet = await petService.updatePet(petId, updatedPetData);

    // After updating the pet, refresh the owner to ensure its pets list is consistent
    // Or manually update the pet within the owner's pets array in memory
    const existingPetInOwner = owner.pets.find(p => p.id === petId);
    if (existingPetInOwner) {
      Object.assign(existingPetInOwner, updatedPet.dataValues);
      existingPetInOwner.type = res.locals.types.find(t => t.id === updatedPetData.type_id);
    }

    req.flash = { message: res.__('Pet details has been edited') };
    res.redirect(`/owners/${owner.id}`);
  } catch (error) {
    console.error(`Error updating pet ${petId}:`, error);
    req.flash = { error: res.__('error', { context: 'editing the pet' }) };
    return res.render(VIEWS_PETS_CREATE_OR_UPDATE_FORM, {
      owner: owner,
      pet: { ...req.body, id: petId, isNew: () => false },
      types: res.locals.types,
      flash: req.flash
    });
  }
}

module.exports = {
  populatePetTypes,
  loadPet,
  initCreationForm,
  processCreationForm,
  initUpdateForm,
  processUpdateForm
};
