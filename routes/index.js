/**
 * Main Routes File
 * 
 * Aggregates all controller routes into Express Router.
 */
const express = require('express');
const router = express.Router();

const ownerController = require('../controllers/ownerController');
const petController = require('../controllers/petController');
const visitController = require('../controllers/visitController');
const vetController = require('../controllers/vetController');

// Home
router.get('/', (req, res) => res.render('welcome'));

// Owners
router.get('/owners/find', ownerController.initFindForm);
router.get('/owners', ownerController.processFindForm);
router.get('/owners/new', ownerController.initCreationForm);
router.post('/owners/new', ownerController.processCreationForm);
router.get('/owners/:ownerId/edit', ownerController.initUpdateOwnerForm);
router.post('/owners/:ownerId/edit', ownerController.processUpdateOwnerForm);
router.get('/owners/:ownerId', ownerController.showOwner);

// Pets
router.use('/owners/:ownerId/pets', petController.findOwner); // Middleware
router.use('/owners/:ownerId/pets', petController.populatePetTypes); // Middleware

router.get('/owners/:ownerId/pets/new', petController.initCreationForm);
router.post('/owners/:ownerId/pets/new', petController.processCreationForm);
router.get('/owners/:ownerId/pets/:petId/edit', petController.initUpdateForm);
router.post('/owners/:ownerId/pets/:petId/edit', petController.processUpdateForm);

// Visits
router.use('/owners/:ownerId/pets/:petId', visitController.loadPetWithVisits); // Middleware
router.get('/owners/:ownerId/pets/:petId/visits/new', visitController.initNewVisitForm);
router.post('/owners/:ownerId/pets/:petId/visits/new', visitController.processNewVisitForm);

// Vets
router.get('/vets.html', vetController.showVetList);
router.get('/vets', vetController.showResourcesVetList);

// Error Simulation
router.get('/oups', (req, res) => {
  throw new Error('Expected: controller used to showcase what happens when an exception is thrown');
});

module.exports = router;
