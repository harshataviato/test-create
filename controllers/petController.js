/**
 * @module controllers/petController
 * @description Controller for managing Pet entities (add, edit) within an owner's profile.
 */

const { validationResult } = require('express-validator');
const db = require('../config/database');
const moment = require('moment'); // For date handling

/**
 * @function showCreatePetForm
 * @description Renders the form to add a new pet to a specific owner.
 * @param {import('express').Request} req - The Express request object, including `ownerId` in params.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
exports.showCreatePetForm = async (req, res, next) => {
  const ownerId = req.params.ownerId;

  try {
    const owner = await db.Owner.findByPk(ownerId);
    if (!owner) {
      return res.status(404).render('error', { title: res.__('common.error'), message: res.__('owner.notFoundById', { ownerId }) });
    }
    const petTypes = await db.PetType.findAll(); // Get all available pet types

    res.render('pets/createOrUpdatePetForm', {
      owner,
      pet: { ownerId: owner.id, birthDate: moment().format('YYYY-MM-DD') }, // Pre-fill ownerId and current date for birthDate
      petTypes,
      title: res.__('pet.newPetTitle', { ownerName: owner.fullName }),
      isNew: true,
      errors: {}
    });
  } catch (error) {
    console.error(`Error fetching data for new pet form for owner ID ${ownerId}:`, error);
    next(error);
  }
};

/**
 * @function processCreatePetForm
 * @description Processes the form submission to add a new pet to an owner.
 * Validates input and creates the pet record.
 * @param {import('express').Request} req - The Express request object, including `ownerId` in params.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
exports.processCreatePetForm = async (req, res, next) => {
  const ownerId = req.params.ownerId;
  const errors = validationResult(req); // Get validation errors from express-validator

  try {
    const owner = await db.Owner.findByPk(ownerId);
    if (!owner) {
      return res.status(404).render('error', { title: res.__('common.error'), message: res.__('owner.notFoundById', { ownerId }) });
    }
    const petTypes = await db.PetType.findAll();

    // Attach ownerId from params to the request body before validation/creation
    req.body.ownerId = owner.id;

    if (!errors.isEmpty()) {
      return res.status(400).render('pets/createOrUpdatePetForm', {
        owner,
        pet: req.body, // Pass submitted data back to form
        petTypes,
        title: res.__('pet.newPetTitle', { ownerName: owner.fullName }),
        isNew: true,
        errors: errors.mapped()
      });
    }

    const newPet = await db.Pet.create(req.body);
    res.redirect(`/owners/${owner.id}`); // Redirect to the owner's details page

  } catch (error) {
    console.error(`Error creating new pet for owner ID ${ownerId}:`, error);
    if (error.name === 'SequelizeValidationError') {
      const formattedErrors = {};
      error.errors.forEach(err => {
        formattedErrors[err.path] = { msg: err.message };
      });
      // Re-fetch pet types for the form if validation fails
      const petTypes = await db.PetType.findAll();
      return res.status(400).render('pets/createOrUpdatePetForm', {
        owner: await db.Owner.findByPk(ownerId), // Ensure owner object is fully loaded
        pet: req.body,
        petTypes,
        title: res.__('pet.newPetTitle', { ownerName: (await db.Owner.findByPk(ownerId)).fullName }),
        isNew: true,
        errors: formattedErrors
      });
    }
    next(error);
  }
};

/**
 * @function showUpdatePetForm
 * @description Renders the form to edit an existing pet.
 * @param {import('express').Request} req - The Express request object, including `ownerId` and `petId` in params.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
exports.showUpdatePetForm = async (req, res, next) => {
  const ownerId = req.params.ownerId;
  const petId = req.params.petId;

  try {
    const owner = await db.Owner.findByPk(ownerId);
    if (!owner) {
      return res.status(404).render('error', { title: res.__('common.error'), message: res.__('owner.notFoundById', { ownerId }) });
    }

    const pet = await db.Pet.findByPk(petId, {
      include: [{ model: db.PetType, as: 'type' }]
    });

    if (!pet || pet.ownerId !== owner.id) {
      // Pet not found or does not belong to the specified owner
      return res.status(404).render('error', { title: res.__('common.error'), message: res.__('pet.notFoundById', { petId }) });
    }

    const petTypes = await db.PetType.findAll();

    // Format birthDate for input[type="date"]
    pet.birthDate = moment(pet.birthDate).format('YYYY-MM-DD');

    res.render('pets/createOrUpdatePetForm', {
      owner,
      pet,
      petTypes,
      title: res.__('pet.editPetTitle', { petName: pet.name }),
      isNew: false,
      errors: {}
    });
  } catch (error) {
    console.error(`Error fetching pet for update ID ${petId} (owner ID ${ownerId}):`, error);
    next(error);
  }
};

/**
 * @function processUpdatePetForm
 * @description Processes the form submission to update an existing pet.
 * Validates input and updates the pet record.
 * @param {import('express').Request} req - The Express request object, including `ownerId` and `petId` in params.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
exports.processUpdatePetForm = async (req, res, next) => {
  const ownerId = req.params.ownerId;
  const petId = req.params.petId;
  const errors = validationResult(req);

  try {
    const owner = await db.Owner.findByPk(ownerId);
    if (!owner) {
      return res.status(404).render('error', { title: res.__('common.error'), message: res.__('owner.notFoundById', { ownerId }) });
    }

    const pet = await db.Pet.findByPk(petId);
    if (!pet || pet.ownerId !== owner.id) {
      return res.status(404).render('error', { title: res.__('common.error'), message: res.__('pet.notFoundById', { petId }) });
    }

    const petTypes = await db.PetType.findAll();

    // Ensure ownerId is correctly set from params, not user input
    req.body.ownerId = owner.id;

    if (!errors.isEmpty()) {
      // Pass original pet object with updated data for rendering
      const petToRender = { ...pet.toJSON(), ...req.body, id: petId };
      return res.status(400).render('pets/createOrUpdatePetForm', {
        owner,
        pet: petToRender,
        petTypes,
        title: res.__('pet.editPetTitle', { petName: petToRender.name }),
        isNew: false,
        errors: errors.mapped()
      });
    }

    await pet.update(req.body); // Update the pet with validated data
    res.redirect(`/owners/${owner.id}`); // Redirect to the owner's details page

  } catch (error) {
    console.error(`Error updating pet ID ${petId} (owner ID ${ownerId}):`, error);
    if (error.name === 'SequelizeValidationError') {
      const formattedErrors = {};
      error.errors.forEach(err => {
        formattedErrors[err.path] = { msg: err.message };
      });
      const petTypes = await db.PetType.findAll();
      // Re-fetch pet for form rendering to ensure proper state if validation fails
      const petToRender = await db.Pet.findByPk(petId) || { id: petId, ownerId: ownerId };
      return res.status(400).render('pets/createOrUpdatePetForm', {
        owner,
        pet: { ...petToRender.toJSON(), ...req.body },
        petTypes,
        title: res.__('pet.editPetTitle', { petName: req.body.name }),
        isNew: false,
        errors: formattedErrors
      });
    }
    next(error);
  }
};
