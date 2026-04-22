const express = require('express');
const router = express.Router({ mergeParams: true });
const { Owner, Pet, PetType } = require('../models');

/**
 * GET /owners/:ownerId/pets/new
 */
router.get('/new', async (req, res) => {
  const owner = await Owner.findByPk(req.params.ownerId);
  const types = await PetType.findAll();
  res.render('pets/createOrUpdatePetForm', { owner, pet: {}, types, menu: 'owners' });
});

/**
 * POST /owners/:ownerId/pets/new
 */
router.post('/new', async (req, res) => {
  const { name, birthDate, typeId } = req.body;
  await Pet.create({
    name,
    birthDate,
    type_id: typeId,
    owner_id: req.params.ownerId
  });
  res.redirect(`/owners/${req.params.ownerId}`);
});

/**
 * GET /owners/:ownerId/pets/:petId/edit
 */
router.get('/:petId/edit', async (req, res) => {
  const owner = await Owner.findByPk(req.params.ownerId);
  const pet = await Pet.findByPk(req.params.petId);
  const types = await PetType.findAll();
  res.render('pets/createOrUpdatePetForm', { owner, pet, types, menu: 'owners' });
});

/**
 * POST /owners/:ownerId/pets/:petId/edit
 */
router.post('/:petId/edit', async (req, res) => {
  await Pet.update({
    name: req.body.name,
    birthDate: req.body.birthDate,
    type_id: req.body.typeId
  }, { where: { id: req.params.petId } });
  res.redirect(`/owners/${req.params.ownerId}`);
});

/**
 * Visit resource routing
 */
router.use('/:petId/visits', require('./visit'));

module.exports = router;
