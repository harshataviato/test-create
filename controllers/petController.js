const express = require('express');
const router = express.Router({ mergeParams: true });
const { Owner, Pet, PetType } = require('../models');

/**
 * Management of Pets for a specific Owner.
 */
router.get('/new', async (req, res) => {
  const owner = await Owner.findByPk(req.params.ownerId);
  const types = await PetType.findAll();
  res.render('pets/createOrUpdatePetForm', { owner, types, pet: { isNew: true } });
});

router.post('/new', async (req, res) => {
  await Pet.create({
    ...req.body,
    ownerId: req.params.ownerId,
    typeId: req.body.type
  });
  res.redirect(`/owners/${req.params.ownerId}`);
});

router.get('/:petId/edit', async (req, res) => {
  const owner = await Owner.findByPk(req.params.ownerId);
  const pet = await Pet.findByPk(req.params.petId);
  const types = await PetType.findAll();
  res.render('pets/createOrUpdatePetForm', { owner, pet, types, isNew: false });
});

router.post('/:petId/edit', async (req, res) => {
  await Pet.update({
    ...req.body,
    typeId: req.body.type
  }, { where: { id: req.params.petId } });
  res.redirect(`/owners/${req.params.ownerId}`);
});

module.exports = router;
