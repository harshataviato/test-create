/**
 * Pet Controller
 * 
 * Handles adding and updating pets.
 * Validates birth dates and checks for duplicate names within the owner's pets.
 */
const { Owner, Pet, PetType } = require('../models');
const { body, validationResult } = require('express-validator');
const moment = require('moment');

// Populate PetTypes for dropdowns (middleware)
exports.populatePetTypes = async (req, res, next) => {
  try {
    res.locals.types = await PetType.findAll({ order: [['name', 'ASC']] });
    next();
  } catch (err) {
    next(err);
  }
};

// Find owner (middleware)
exports.findOwner = async (req, res, next) => {
  try {
    const owner = await Owner.findByPk(req.params.ownerId, { include: [{ model: Pet, as: 'pets' }]});
    if (!owner) return res.status(404).render('error', { message: 'Owner not found' });
    req.owner = owner;
    res.locals.owner = owner;
    next();
  } catch (err) {
    next(err);
  }
};

// Validation
const petValidationRules = [
  body('name').notEmpty().withMessage('Name is required'),
  body('birthDate').isDate().withMessage('Invalid date format'),
  body('type_id').notEmpty().withMessage('Type is required')
];

exports.initCreationForm = (req, res) => {
  res.render('pets/createOrUpdatePetForm', { pet: { new: true }, errors: null });
};

exports.processCreationForm = [
  petValidationRules,
  async (req, res) => {
    const errors = validationResult(req);
    const { name, birthDate, type_id } = req.body;

    // Custom Validation: Check duplicates
    const duplicate = req.owner.pets.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (duplicate) {
      // Manually add error
      errors.errors.push({ msg: 'is already in use', path: 'name' });
    }

    if (!errors.isEmpty()) {
      return res.render('pets/createOrUpdatePetForm', { 
        pet: { ...req.body, new: true }, 
        errors: errors.array() 
      });
    }

    try {
      await Pet.create({
        name,
        birthDate,
        type_id,
        owner_id: req.owner.id
      });
      res.redirect(`/owners/${req.owner.id}`);
    } catch (err) {
      console.error(err);
      res.render('error', { message: 'Error creating pet' });
    }
  }
];

exports.initUpdateForm = async (req, res) => {
  try {
    const pet = await Pet.findByPk(req.params.petId);
    if (!pet) return res.status(404).render('error', { message: 'Pet not found' });
    res.render('pets/createOrUpdatePetForm', { pet, errors: null });
  } catch (err) {
    res.render('error', { message: 'Database error' });
  }
};

exports.processUpdateForm = [
  petValidationRules,
  async (req, res) => {
    const errors = validationResult(req);
    const { petId } = req.params;

    if (!errors.isEmpty()) {
      return res.render('pets/createOrUpdatePetForm', { 
        pet: { ...req.body, id: petId }, 
        errors: errors.array() 
      });
    }

    try {
      await Pet.update(req.body, { where: { id: petId } });
      res.redirect(`/owners/${req.owner.id}`);
    } catch (err) {
      res.render('error', { message: 'Error updating pet' });
    }
  }
];
