/**
 * Pet Controller
 * Handles adding/editing pets for a specific owner.
 */
const express = require('express');
const router = express.Router();
const db = require('../models');
const { body, validationResult } = require('express-validator');

// Load owner middleware
const loadOwner = async (req, res, next) => {
  req.owner = await db.Owner.findByPk(req.params.ownerId);
  if (!req.owner) return res.status(404).send('Owner not found');
  next();
};

const petValidationRules = [
  body('name').notEmpty().withMessage('is required'),
  body('birthDate').isDate().withMessage('invalid date'),
  body('typeId').notEmpty().withMessage('is required')
];

// GET /owners/:ownerId/pets/new
router.get('/owners/:ownerId/pets/new', loadOwner, async (req, res) => {
  const types = await db.PetType.findAll();
  res.render('pets/createOrUpdatePetForm', { 
    owner: req.owner, 
    pet: {}, 
    types, 
    errors: null 
  });
});

// POST /owners/:ownerId/pets/new
router.post('/owners/:ownerId/pets/new', loadOwner, petValidationRules, async (req, res) => {
  const types = await db.PetType.findAll();
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render('pets/createOrUpdatePetForm', { 
      owner: req.owner, 
      pet: req.body, 
      types, 
      errors: errors.mapped() 
    });
  }

  // Check for duplicate name
  const existingPet = await db.Pet.findOne({ where: { name: req.body.name, ownerId: req.owner.id }});
  if (existingPet) {
    return res.render('pets/createOrUpdatePetForm', { 
        owner: req.owner, 
        pet: req.body, 
        types, 
        errors: { name: { msg: 'is already in use' } } 
      });
  }

  await db.Pet.create({ ...req.body, ownerId: req.owner.id });
  res.redirect(`/owners/${req.owner.id}`);
});

// GET /owners/:ownerId/pets/:petId/edit
router.get('/owners/:ownerId/pets/:petId/edit', loadOwner, async (req, res) => {
  const types = await db.PetType.findAll();
  const pet = await db.Pet.findByPk(req.params.petId);
  res.render('pets/createOrUpdatePetForm', { 
    owner: req.owner, 
    pet, 
    types, 
    errors: null 
  });
});

// POST /owners/:ownerId/pets/:petId/edit
router.post('/owners/:ownerId/pets/:petId/edit', loadOwner, petValidationRules, async (req, res) => {
  const errors = validationResult(req);
  const types = await db.PetType.findAll();

  if (!errors.isEmpty()) {
    const pet = req.body;
    pet.id = req.params.petId;
    return res.render('pets/createOrUpdatePetForm', { 
      owner: req.owner, 
      pet, 
      types, 
      errors: errors.mapped() 
    });
  }

  await db.Pet.update(req.body, { where: { id: req.params.petId } });
  res.redirect(`/owners/${req.owner.id}`);
});

module.exports = router;
