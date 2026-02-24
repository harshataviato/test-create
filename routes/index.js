import express from 'express';
import * as welcomeController from '../controllers/welcomeController.js';
import * as ownerController from '../controllers/ownerController.js';
import * as petController from '../controllers/petController.js';
import * as visitController from '../controllers/visitController.js';
import * as vetController from '../controllers/vetController.js';
import * as crashController from '../controllers/crashController.js';

const router = express.Router();

// Home
router.get('/', welcomeController.welcome);

// Owners
router.get('/owners/find', ownerController.initFindForm);
router.get('/owners', ownerController.processFindForm);
router.get('/owners/new', ownerController.initCreationForm);
router.post('/owners/new', ownerController.validateOwner, ownerController.processCreationForm);
router.get('/owners/:ownerId', ownerController.showOwner);
router.get('/owners/:ownerId/edit', ownerController.initUpdateOwnerForm);
router.post('/owners/:ownerId/edit', ownerController.validateOwner, ownerController.processUpdateOwnerForm);

// Pets
router.get('/owners/:ownerId/pets/new', petController.initCreationForm);
router.post('/owners/:ownerId/pets/new', petController.validatePet, petController.processCreationForm);
router.get('/owners/:ownerId/pets/:petId/edit', petController.initUpdateForm);
router.post('/owners/:ownerId/pets/:petId/edit', petController.validatePet, petController.processUpdateForm);

// Visits
router.get('/owners/:ownerId/pets/:petId/visits/new', visitController.initNewVisitForm);
router.post('/owners/:ownerId/pets/:petId/visits/new', visitController.validateVisit, visitController.processNewVisitForm);

// Vets
router.get('/vets.html', vetController.showVetList);
router.get('/vets', vetController.showResourcesVetList); // JSON endpoint

// Crash
router.get('/oups', crashController.triggerException);

export default router;
