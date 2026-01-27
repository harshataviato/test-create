/**
 * @fileoverview Controller for handling Pet-related operations for a specific Owner.
 * This includes adding, editing, and displaying pets.
 */

const { validationResult } = require('express-validator');
const db = require('../models');
const Owner = db.Owner;
const Pet = db.Pet;
const PetType = db.PetType;
const Visit = db.Visit;

/**
 * Helper function to load pet types for forms.
 * @returns {Promise<Array<PetType>>} A promise that resolves to an array of pet types.
 */
async function loadPetTypes() {
  return PetType.findAll({ order: [['name', 'ASC']] });
}

/**
 * Helper function to load owner and their pets, and handle not found scenarios.
 * @param {number} ownerId - The ID of the owner.
 * @param {express.Request} req - The Express request object.
 * @param {express.Response} res - The Express response object.
 * @param {express.NextFunction} next - The Express next middleware function.
 * @returns {Promise<Owner|null>} The owner object if found, otherwise null (and handles response).
 */
async function loadOwnerAndPets(ownerId, req, res, next) {
  try {
    const owner = await Owner.findByPk(ownerId, {
      include: [{
        model: Pet,
        as: 'pets',
        include: [{ model: PetType, as: 'type' }]
      }]
    });
    if (!owner) {
      req.flash('error', req.__('owner.notFoundById', ownerId));
      res.redirect('/owners'); // Redirect to find owners if owner not found
      return null;
    }
    return owner;
  } catch (error) {
    next(error);
    return null;
  }
}

/**
 * Helper function to load pet and its owner/type, and handle not found scenarios.
 * @param {number} ownerId - The ID of the owner.
 * @param {number} petId - The ID of the pet.
 * @param {express.Request} req - The Express request object.
 * @param {express.Response} res - The Express response object.
 * @param {express.NextFunction} next - The Express next middleware function.
 * @returns {Promise<Pet|null>} The pet object if found, otherwise null (and handles response).
 */
async function loadPetAndOwner(ownerId, petId, req, res, next) {
  try {
    const pet = await Pet.findByPk(petId, {
      include: [{ model: Owner, as: 'owner' }, { model: PetType, as: 'type' }]
    });

    if (!pet || pet.ownerId !== parseInt(ownerId)) {
      req.flash('error', req.__('pet.notFoundForOwner', petId, ownerId));
      res.redirect(`/owners/${ownerId}`);
      return null;
    }
    return pet;
  } catch (error) {
    next(error);
    return null;
  }
}


/**
 * @function newPetForm
 * @description Renders the form for adding a new pet to an owner.
 * @param {express.Request} req - The Express request object.
 * @param {express.Response} res - The Express response object.
 * @param {express.NextFunction} next - The Express next middleware function.
 */
exports.newPetForm = async (req, res, next) => {
  const ownerId = req.params.ownerId;
  const owner = await loadOwnerAndPets(ownerId, req, res, next);
  if (!owner) return;

  const petTypes = await loadPetTypes();
  const pet = Pet.build({ ownerId: owner.id, birthDate: new Date() }); // Default birthDate to today

  res.render('pets/createOrUpdatePetForm', {
    owner: owner,
    pet: pet,
    petTypes: petTypes,
    title: req.__('pet.new')
  });
};

/**
 * @function create
 * @description Handles the submission of the new pet form, creates a new pet record.
 * @param {express.Request} req - The Express request object.
 * @param {express.Response} res - The Express response object.
 * @param {express.NextFunction} next - The Express next middleware function.
 */
exports.create = async (req, res, next) => {
  const ownerId = req.params.ownerId;
  const owner = await loadOwnerAndPets(ownerId, req, res, next);
  if (!owner) return;

  const errors = validationResult(req);
  const petTypes = await loadPetTypes();

  if (!errors.isEmpty()) {
    // There are validation errors, re-render the form with error messages
    const pet = Pet.build({ ...req.body, ownerId: owner.id }); // Re-populate form with submitted data
    return res.render('pets/createOrUpdatePetForm', {
      owner: owner,
      pet: pet,
      petTypes: petTypes,
      title: req.__('pet.new'),
      errors: errors.array()
    });
  }

  try {
    const { name, birthDate, type_id } = req.body;
    const petType = await PetType.findByPk(type_id);
    if (!petType) {
      req.flash('error', req.__('pet.typeNotFound'));
      return res.render('pets/createOrUpdatePetForm', {
        owner: owner,
        pet: Pet.build({ ...req.body, ownerId: owner.id }),
        petTypes: petTypes,
        title: req.__('pet.new'),
        errors: req.flash('error')
      });
    }

    const newPet = await Pet.create({
      name,
      birthDate,
      typeId: type_id,
      ownerId: owner.id
    });

    req.flash('message', req.__('pet.created', newPet.name, owner.firstName, owner.lastName));
    res.redirect(`/owners/${owner.id}`);

  } catch (error) {
    next(error);
  }
};

/**
 * @function editPetForm
 * @description Renders the form for editing an existing pet.
 * @param {express.Request} req - The Express request object.
 * @param {express.Response} res - The Express response object.
 * @param {express.NextFunction} next - The Express next middleware function.
 */
exports.editPetForm = async (req, res, next) => {
  const ownerId = req.params.ownerId;
  const petId = req.params.petId;

  const owner = await loadOwnerAndPets(ownerId, req, res, next);
  if (!owner) return;

  const pet = await loadPetAndOwner(ownerId, petId, req, res, next);
  if (!pet) return;

  const petTypes = await loadPetTypes();

  res.render('pets/createOrUpdatePetForm', {
    owner: owner,
    pet: pet,
    petTypes: petTypes,
    title: req.__('pet.edit')
  });
};

/**
 * @function update
 * @description Handles the submission of the edit pet form, updates an existing pet record.
 * @param {express.Request} req - The Express request object.
 * @param {express.Response} res - The Express response object.
 * @param {express.NextFunction} next - The Express next middleware function.
 */
exports.update = async (req, res, next) => {
  const ownerId = req.params.ownerId;
  const petId = req.params.petId;

  const owner = await loadOwnerAndPets(ownerId, req, res, next);
  if (!owner) return;

  const errors = validationResult(req);
  const petTypes = await loadPetTypes();

  if (!errors.isEmpty()) {
    // There are validation errors, re-render the form with error messages
    const pet = Pet.build({ id: petId, ...req.body, ownerId: owner.id }); // Preserve ID
    return res.render('pets/createOrUpdatePetForm', {
      owner: owner,
      pet: pet,
      petTypes: petTypes,
      title: req.__('pet.edit'),
      errors: errors.array()
    });
  }

  try {
    const pet = await loadPetAndOwner(ownerId, petId, req, res, next);
    if (!pet) return;

    const { name, birthDate, type_id } = req.body;
    const petType = await PetType.findByPk(type_id);
    if (!petType) {
      req.flash('error', req.__('pet.typeNotFound'));
      return res.render('pets/createOrUpdatePetForm', {
        owner: owner,
        pet: Pet.build({ id: petId, ...req.body, ownerId: owner.id }),
        petTypes: petTypes,
        title: req.__('pet.edit'),
        errors: req.flash('error')
      });
    }

    await pet.update({
      name,
      birthDate,
      typeId: type_id // Update the foreign key
    });

    req.flash('message', req.__('pet.updated', pet.name, owner.firstName, owner.lastName));
    res.redirect(`/owners/${owner.id}`);

  } catch (error) {
    next(error);
  }
};

