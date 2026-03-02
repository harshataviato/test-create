const express = require('express');
const router = express.Router();
const ownerCtrl = require('../controllers/ownerController');
const petCtrl = require('../controllers/petController');
const visitCtrl = require('../controllers/visitController');
const db = require('../models');

// System
router.get('/', (req, res) => res.render('welcome'));
router.get('/oups', (req, res) => { throw new Error('Expected: Showcase exception'); });

// Owners
router.get('/owners/find', ownerCtrl.initFindForm);
router.get('/owners', ownerCtrl.processFindForm);
router.get('/owners/new', ownerCtrl.initCreationForm);
router.post('/owners/new', ownerCtrl.processCreationForm);
router.get('/owners/:ownerId', ownerCtrl.showOwner);
router.get('/owners/:ownerId/edit', ownerCtrl.initUpdateOwnerForm);
router.post('/owners/:ownerId/edit', ownerCtrl.processUpdateOwnerForm);

// Pets
router.get('/owners/:ownerId/pets/new', (req, res) => petCtrl.initCreationForm(req, res));
router.post('/owners/:ownerId/pets/new', (req, res) => petCtrl.processCreationForm(req, res));
router.get('/owners/:ownerId/pets/:petId/edit', (req, res) => petCtrl.initUpdateForm(req, res));
router.post('/owners/:ownerId/pets/:petId/edit', (req, res) => petCtrl.processUpdateForm(req, res));

// Visits
router.get('/owners/:ownerId/pets/:petId/visits/new', visitCtrl.initNewVisitForm);
router.post('/owners/:ownerId/pets/:petId/visits/new', visitCtrl.processNewVisitForm);

// Vets
router.get('/vets.html', async (req, res) => {
  const vets = await db.Vet.findAll({ include: ['specialties'] });
  res.render('vets/vetList', { listVets: vets });
});

module.exports = router;
