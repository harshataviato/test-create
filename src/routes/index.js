/**
 * Main Router Configuration
 */
const express = require('express');
const router = express.Router();
const vetController = require('../controllers/vetController');
const ownerController = require('../controllers/ownerController');
const petController = require('../controllers/petController');
const visitController = require('../controllers/visitController');
const { ownerValidators, petValidators, visitValidators } = require('../utils/validators');

// Home
router.get('/', (req, res) => res.render('welcome'));

// Vets
router.get('/vets.html', vetController.showVetList);
router.get('/vets', vetController.getVetsJson);

// Owners
router.get('/owners/find', ownerController.initFindForm);
router.get('/owners', ownerController.processFindForm);
router.get('/owners/new', ownerController.initCreationForm);
router.post('/owners/new', ownerValidators, ownerController.processCreationForm);
router.get('/owners/:id', ownerController.showOwner);
router.get('/owners/:id/edit', ownerController.initUpdateOwnerForm);
router.post('/owners/:id/edit', ownerValidators, ownerController.processUpdateOwnerForm);

// Pets
// Parameter middleware to resolve ownerId
router.param('ownerId', petController.findOwner);

router.use('/owners/:ownerId/pets', petController.populatePetTypes);
router.get('/owners/:ownerId/pets/new', petController.initCreationForm);
router.post('/owners/:ownerId/pets/new', petValidators, petController.processCreationForm);
router.get('/owners/:ownerId/pets/:petId/edit', petController.initUpdateForm);
router.post('/owners/:ownerId/pets/:petId/edit', petValidators, petController.processUpdateForm);

// Visits
router.get('/owners/:ownerId/pets/:petId/visits/new', visitController.initNewVisitForm);
router.post('/owners/:ownerId/pets/:petId/visits/new', visitValidators, visitController.processNewVisitForm);

// Error simulation
router.get('/oups', (req, res) => {
  throw new Error("Expected: controller used to showcase what happens when an exception is thrown");
});

module.exports = router;
