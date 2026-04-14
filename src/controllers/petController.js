/**
 * @file controllers/petController.js
 * @description Controller for managing pet-related operations within an owner's context.
 * Handles HTTP requests for creating and updating pet information.
 * Mimics Spring PetClinic's `PetController.java`.
 */

const petService = require('../services/petService');
const ownerService = require('../services/ownerService');
const petTypeService = require('../services/petTypeService');
const { validationResult } = require('express-validator');
const Pet = require('../models/pet'); // For creating new instances
const moment = require('moment'); // For date comparisons

const VIEWS_PETS_CREATE_OR_UPDATE_FORM = 'pets/createOrUpdatePetForm';

/**
 * @middleware findPetMiddleware
 * @description Middleware to find a pet by ID within the current owner's pets.
 * This mimics Spring's `@ModelAttribute("pet")` with `@PathVariable`.
 * It attaches the found pet to `req.pet` and `res.locals.pet`,
 * or initializes a new `Pet` if `petId` is not provided (for creation forms).
 * Requires `req.owner` to be already populated by `ownerController.findOwnerMiddleware`.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
exports.findPetMiddleware = async (req, res, next) => {
  const petId = req.params.petId;
  if (!req.owner) {
    // This should ideally not happen if ownerMiddleware runs first
    return next(new Error(req.__('Owner not found. Cannot find pet.')));
  }

  if (petId) {
    try {
      // Find the pet within the owner's pets array (if eagerly loaded)
      // Or fetch directly if owner.pets is not guaranteed to be loaded with all fields
      const pet = await petService.findPetByIdAndOwnerId(petId, req.owner.id);
      if (!pet) {
        throw new Error(req.__('Pet not found with id: ') + petId + req.__(' for owner with id: ') + req.owner.id + req.__('. Please ensure the ID is correct.'));
      }
      req.pet = pet;
      res.locals.pet = pet; // Make pet available in templates
      next();
    } catch (error) {
      next(error);
    }
  } else {
    // For 'new' pet creation, create a blank pet object
    req.pet = new Pet();
    req.owner.addPet(req.pet); // Associate the new pet with the owner for form context
    res.locals.pet = req.pet; // Make available in templates for form binding
    next();
  }
};

/**
 * @function initCreationForm
 * @description Renders the form for adding a new pet to an owner.
 * Pre-populates pet types for the dropdown.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
exports.initCreationForm = async (req, res, next) => {
  try {
    const petTypes = await petTypeService.findAllPetTypes();
    res.locals.types = petTypes; // Make pet types available in templates
    // req.pet and req.owner are already set by middleware
    res.render(VIEWS_PETS_CREATE_OR_UPDATE_FORM, { pet: req.pet, owner: req.owner, types: petTypes, title: req.__('addNewPet') });
  } catch (error) {
    next(error);
  }
};

/**
 * @function processCreationForm
 * @description Processes the form submission for creating a new pet.
 * Handles validation, including duplicate pet names and future birth dates.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
exports.processCreationForm = async (req, res, next) => {
  const errors = validationResult(req);
  const owner = req.owner; // Owner is loaded by middleware
  const pet = req.pet; // Pet is initialized by middleware as new

  try {
    const petTypes = await petTypeService.findAllPetTypes();
    res.locals.types = petTypes;

    // Custom validation logic from Spring PetClinic's PetController
    if (req.body.name && pet.isNew() && owner.getPetByName(req.body.name, true)) {
      errors.errors.push({ param: 'name', msg: req.__('duplicate') });
    }

    const birthDate = req.body.birthDate ? moment(req.body.birthDate, 'YYYY-MM-DD') : null;
    if (birthDate && birthDate.isValid() && birthDate.isAfter(moment())) {
      errors.errors.push({ param: 'birthDate', msg: req.__('typeMismatch.birthDate') });
    }

    if (!errors.isEmpty()) {
      req.flash('error', errors.array().map(e => e.msg).join(', '));
      return res.render(VIEWS_PETS_CREATE_OR_UPDATE_FORM, {
        owner,
        pet: { ...pet.toJSON(), ...req.body, isNew: true }, // Re-populate form with submitted data + original ID status
        errors: errors.array(),
        types: petTypes,
        title: req.__('addNewPet')
      });
    }

    // Assign owner and pet type to the pet object
    pet.ownerId = owner.id;
    const petType = await petTypeService.findPetTypeByName(req.body.type);
    if (!petType) {
      errors.errors.push({ param: 'type', msg: req.__('typeMismatch.petType') });
      req.flash('error', errors.array().map(e => e.msg).join(', '));
      return res.render(VIEWS_PETS_CREATE_OR_UPDATE_FORM, {
        owner,
        pet: { ...pet.toJSON(), ...req.body, isNew: true },
        errors: errors.array(),
        types: petTypes,
        title: req.__('addNewPet')
      });
    }
    pet.typeId = petType.id;
    pet.type = petType; // For display on redirect

    // Update pet object with form data
    pet.name = req.body.name;
    pet.birthDate = birthDate ? birthDate.format('YYYY-MM-DD') : null;

    await petService.savePet(pet); // Save the new pet
    req.flash('success', req.__('New Pet has been Added'));
    res.redirect(`/owners/${owner.id}`);
  } catch (error) {
    next(error);
  }
};

/**
 * @function initUpdateForm
 * @description Renders the form for updating an existing pet.
 * Pre-populates pet types for the dropdown.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
exports.initUpdateForm = async (req, res, next) => {
  try {
    const petTypes = await petTypeService.findAllPetTypes();
    res.locals.types = petTypes;
    // req.pet and req.owner are already set by middleware
    res.render(VIEWS_PETS_CREATE_OR_UPDATE_FORM, { pet: req.pet, owner: req.owner, types: petTypes, title: req.__('editPet') });
  } catch (error) {
    next(error);
  }
};

/**
 * @function processUpdateForm
 * @description Processes the form submission for updating an existing pet.
 * Handles validation and updates the pet details.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
exports.processUpdateForm = async (req, res, next) => {
  const errors = validationResult(req);
  const owner = req.owner; // Owner is loaded by middleware
  const pet = req.pet; // Pet is loaded by middleware (existing)

  try {
    const petTypes = await petTypeService.findAllPetTypes();
    res.locals.types = petTypes;

    // Custom validation: check for duplicate pet names for the same owner (excluding the current pet being updated)
    if (req.body.name) {
      const existingPetWithSameName = owner.pets.find(
        p => p.name.toLowerCase() === req.body.name.toLowerCase() && p.id !== pet.id
      );
      if (existingPetWithSameName) {
        errors.errors.push({ param: 'name', msg: req.__('duplicate') });
      }
    }

    const birthDate = req.body.birthDate ? moment(req.body.birthDate, 'YYYY-MM-DD') : null;
    if (birthDate && birthDate.isValid() && birthDate.isAfter(moment())) {
      errors.errors.push({ param: 'birthDate', msg: req.__('typeMismatch.birthDate') });
    }

    if (!errors.isEmpty()) {
      req.flash('error', errors.array().map(e => e.msg).join(', '));
      return res.render(VIEWS_PETS_CREATE_OR_UPDATE_FORM, {
        owner,
        pet: { ...pet.toJSON(), ...req.body, id: pet.id, isNew: false }, // Keep existing ID and new data
        errors: errors.array(),
        types: petTypes,
        title: req.__('editPet')
      });
    }

    // Find the pet type by name from the form
    const petType = await petTypeService.findPetTypeByName(req.body.type);
    if (!petType) {
      errors.errors.push({ param: 'type', msg: req.__('typeMismatch.petType') });
      req.flash('error', errors.array().map(e => e.msg).join(', '));
      return res.render(VIEWS_PETS_CREATE_OR_UPDATE_FORM, {
        owner,
        pet: { ...pet.toJSON(), ...req.body, id: pet.id, isNew: false },
        errors: errors.array(),
        types: petTypes,
        title: req.__('editPet')
      });
    }

    // Update the pet object with new data
    pet.name = req.body.name;
    pet.birthDate = birthDate ? birthDate.format('YYYY-MM-DD') : null;
    pet.typeId = petType.id;
    pet.type = petType; // Update type object for potential display

    await petService.updatePet(pet.id, pet); // Save changes to the pet
    req.flash('success', req.__('Pet details has been edited'));
    res.redirect(`/owners/${owner.id}`);
  } catch (error) {
    next(error);
  }
};
