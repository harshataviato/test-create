const express = require('express');
const router = express.Router({ mergeParams: true });
const { Owner, Pet, Visit, PetType } = require('../models');

/**
 * Handles Visit creation.
 */
router.get('/new', async (req, res) => {
  const owner = await Owner.findByPk(req.params.ownerId);
  const pet = await Pet.findByPk(req.params.petId, {
    include: [{ model: Visit, as: 'visits' }, { model: PetType, as: 'type' }]
  });
  res.render('pets/createOrUpdateVisitForm', { owner, pet, visit: { date: new Date().toISOString().split('T')[0] } });
});

router.post('/new', async (req, res) => {
  await Visit.create({
    ...req.body,
    petId: req.params.petId
  });
  res.redirect(`/owners/${req.params.ownerId}`);
});

module.exports = router;
