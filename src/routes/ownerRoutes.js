const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');
const petController = require('../controllers/petController');
const { Visit, Pet, Owner } = require('../models');

// Owner Routes
router.get('/new', ownerController.initCreationForm);
router.post('/new', ownerController.processCreationForm);
router.get('/find', ownerController.initFindForm);
router.get('/', ownerController.processFindForm);
router.get('/:ownerId', ownerController.showOwner);
router.get('/:ownerId/edit', ownerController.initUpdateForm);
router.post('/:ownerId/edit', ownerController.processUpdateForm);

// Pet Routes nested under Owners
router.get('/:ownerId/pets/new', petController.initCreationForm);
router.post('/:ownerId/pets/new', petController.processCreationForm);
router.get('/:ownerId/pets/:petId/edit', petController.initUpdateForm);
router.post('/:ownerId/pets/:petId/edit', petController.processUpdateForm);

// Visit Routes
router.get('/:ownerId/pets/:petId/visits/new', async (req, res) => {
  const owner = await Owner.findByPk(req.params.ownerId);
  const pet = await Pet.findByPk(req.params.petId, { include: ['visits'] });
  res.render('pets/createOrUpdateVisitForm', { owner, pet, visit: {}, menu: 'owners' });
});

router.post('/:ownerId/pets/:petId/visits/new', async (req, res) => {
  await Visit.create({
    description: req.body.description,
    date: req.body.date,
    pet_id: req.params.petId
  });
  res.redirect(`/owners/${req.params.ownerId}`);
});

module.exports = router;
