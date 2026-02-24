/**
 * Visit Controller
 * Handles adding visits to pets.
 */
const express = require('express');
const router = express.Router();
const db = require('../models');
const { body, validationResult } = require('express-validator');

const loadPet = async (req, res, next) => {
  req.pet = await db.Pet.findByPk(req.params.petId, {
    include: [{ model: db.Visit, as: 'visits' }, { model: db.PetType, as: 'type' }]
  });
  req.owner = await db.Owner.findByPk(req.params.ownerId);
  next();
};

const visitValidationRules = [
  body('date').isDate().withMessage('invalid date'),
  body('description').notEmpty().withMessage('required')
];

// GET /owners/*/pets/*/visits/new
router.get('/owners/:ownerId/pets/:petId/visits/new', loadPet, (req, res) => {
  res.render('pets/createOrUpdateVisitForm', {
    pet: req.pet,
    owner: req.owner,
    visit: {},
    errors: null
  });
});

// POST /owners/*/pets/*/visits/new
router.post('/owners/:ownerId/pets/:petId/visits/new', loadPet, visitValidationRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('pets/createOrUpdateVisitForm', {
      pet: req.pet,
      owner: req.owner,
      visit: req.body,
      errors: errors.mapped()
    });
  }

  await db.Visit.create({
    ...req.body,
    petId: req.pet.id
  });

  res.redirect(`/owners/${req.owner.id}`);
});

module.exports = router;
