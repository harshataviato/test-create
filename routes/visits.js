/**
 * Visit Controller
 * Handles adding medical visits for pets
 */
const express = require('express');
const router = express.Router();
const { Owner, Pet, Visit } = require('../models');

// GET /owners/:ownerId/pets/:petId/visits/new
router.get('/:ownerId/pets/:petId/visits/new', async (req, res) => {
  const owner = await Owner.findByPk(req.params.ownerId);
  const pet = await Pet.findByPk(req.params.petId, { include: ['visits', 'type'] });
  res.render('pets/createOrUpdateVisitForm', { 
    menu: 'owners', owner, pet, visit: { isNew: true } 
  });
});

// POST /owners/:ownerId/pets/:petId/visits/new
router.post('/:ownerId/pets/:petId/visits/new', async (req, res) => {
  const { date, description } = req.body;
  await Visit.create({ 
    date, 
    description, 
    petId: req.params.petId 
  });
  res.redirect(`/owners/${req.params.ownerId}`);
});

module.exports = router;
