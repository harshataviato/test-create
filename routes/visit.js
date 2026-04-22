const express = require('express');
const router = express.Router({ mergeParams: true });
const { Owner, Pet, Visit } = require('../models');

/**
 * GET /owners/:ownerId/pets/:petId/visits/new
 */
router.get('/new', async (req, res) => {
  const owner = await Owner.findByPk(req.params.ownerId);
  const pet = await Pet.findByPk(req.params.petId, { include: ['visits', 'type'] });
  res.render('pets/createOrUpdateVisitForm', { owner, pet, visit: {}, menu: 'owners' });
});

/**
 * POST /owners/:ownerId/pets/:petId/visits/new
 */
router.post('/new', async (req, res) => {
  await Visit.create({
    description: req.body.description,
    visitDate: req.body.date,
    pet_id: req.params.petId
  });
  res.redirect(`/owners/${req.params.ownerId}`);
});

module.exports = router;
