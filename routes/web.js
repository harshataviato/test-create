const express = require('express');
const router = express.Router();
const OwnerController = require('../controllers/OwnerController');
const PetController = require('../controllers/PetController');
const VetController = require('../controllers/VetController');

// System
router.get('/', (req, res) => res.render('welcome'));
router.get('/oups', (req) => { throw new Error('Expected: showcase exception'); });

// Owners
router.get('/owners/find', OwnerController.initFindForm);
router.get('/owners', OwnerController.processFindForm);
router.get('/owners/new', OwnerController.initCreationForm);
router.post('/owners/new', OwnerController.processCreationForm);
router.get('/owners/:ownerId', OwnerController.showOwner);
router.get('/owners/:ownerId/edit', OwnerController.initUpdateForm);
router.post('/owners/:ownerId/edit', OwnerController.processUpdateForm);

// Pets
router.get('/owners/:ownerId/pets/new', PetController.initCreationForm);
router.post('/owners/:ownerId/pets/new', PetController.processCreationForm);
router.get('/owners/:ownerId/pets/:petId/edit', PetController.initUpdateForm);
router.post('/owners/:ownerId/pets/:petId/edit', PetController.processUpdateForm);

// Visits
router.get('/owners/:ownerId/pets/:petId/visits/new', async (req, res) => {
    const { Pet, Owner, Visit } = require('../models');
    const pet = await Pet.findByPk(req.params.petId, { include: [Visit, 'type'] });
    const owner = await Owner.findByPk(req.params.ownerId);
    res.render('pets/createOrUpdateVisitForm', { pet, owner, visit: {} });
});

router.post('/owners/:ownerId/pets/:petId/visits/new', async (req, res) => {
    const { Visit } = require('../models');
    await Visit.create({ ...req.body, petId: req.params.petId });
    res.redirect(`/owners/${req.params.ownerId}`);
});

// Vets
router.get('/vets', VetController.showVetList);
router.get('/vets.html', VetController.showVetList);

module.exports = router;
