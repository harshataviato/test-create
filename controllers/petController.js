const db = require('../models');
const { body, validationResult } = require('express-validator');

/**
 * Helper to fetch common data for pet forms.
 */
const getPetFormContext = async (ownerId, petId = null) => {
  const owner = await db.Owner.findByPk(ownerId);
  const types = await db.PetType.findAll();
  let pet = {};
  if (petId) {
    pet = await db.Pet.findByPk(petId);
  }
  return { owner, types, pet };
};

/**
 * Shows form to create a new pet.
 */
exports.initCreationForm = async (req, res) => {
  try {
    const { owner, types } = await getPetFormContext(req.params.ownerId);
    if (!owner) return res.status(404).send('Owner not found');
    res.render('pets/createOrUpdatePetForm', { pet: {}, owner, types });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

/**
 * Processes new pet creation.
 */
exports.processCreationForm = [
  body('name').notEmpty().withMessage('is required'),
  body('birthDate').isDate().withMessage('invalid date'),
  body('typeId').notEmpty().withMessage('is required'),

  async (req, res) => {
    const { owner, types } = await getPetFormContext(req.params.ownerId);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render('pets/createOrUpdatePetForm', {
        pet: req.body,
        owner,
        types,
        errors: errors.array()
      });
    }

    try {
      await db.Pet.create({
        ...req.body,
        ownerId: req.params.ownerId
      });
      res.redirect(`/owners/${req.params.ownerId}`);
    } catch (err) {
      res.status(500).send(err.message);
    }
  }
];

/**
 * Shows form to edit a pet.
 */
exports.initUpdateForm = async (req, res) => {
  try {
    const { owner, types, pet } = await getPetFormContext(req.params.ownerId, req.params.petId);
    if (!pet) return res.status(404).send('Pet not found');
    res.render('pets/createOrUpdatePetForm', { pet, owner, types });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

/**
 * Processes pet update.
 */
exports.processUpdateForm = [
  body('name').notEmpty().withMessage('is required'),
  body('birthDate').isDate().withMessage('invalid date'),
  body('typeId').notEmpty().withMessage('is required'),

  async (req, res) => {
    const errors = validationResult(req);
    const { owner, types } = await getPetFormContext(req.params.ownerId);

    if (!errors.isEmpty()) {
      const pet = req.body;
      pet.id = req.params.petId;
      return res.render('pets/createOrUpdatePetForm', {
        pet,
        owner,
        types,
        errors: errors.array()
      });
    }

    try {
      await db.Pet.update(req.body, { where: { id: req.params.petId } });
      res.redirect(`/owners/${req.params.ownerId}`);
    } catch (err) {
      res.status(500).send(err.message);
    }
  }
];
