/**
 * @file Main router module.
 * @description Aggregates all application routes, acting as the central routing hub.
 * Maps URL paths to appropriate controller functions.
 * @author Google Senior Engineer
 */

const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');
const petController = require('../controllers/petController');
const visitController = require('../controllers/visitController');
const vetController = require('../controllers/vetController');
const systemController = require('../controllers/systemController');
const { ownerValidationRules, petValidationRules, visitValidationRules, validate } = require('../middleware/validation');
const errorHandler = require('../middleware/errorHandler');

/**
 * Owner routes
 */

// Route param middleware for ownerId (mimics @ModelAttribute("owner") in Spring)
router.param('ownerId', ownerController.findOwner);

// Display form for new owner
router.get('/owners/new', ownerController.initCreationForm);

// Process form for new owner
router.post('/owners/new',
  ownerValidationRules(), // Apply validation rules
  validate('owners/createOrUpdateOwnerForm'), // Validate and handle errors, re-render form on failure
  ownerController.processCreationForm
);

// Display form to find owners
router.get('/owners/find', ownerController.initFindForm);

// Process form to find owners by last name (and display list if multiple)
router.get('/owners', ownerController.processFindForm);

// Display form to edit existing owner
router.get('/owners/:ownerId/edit', ownerController.initUpdateOwnerForm);

// Process form to update existing owner
router.post('/owners/:ownerId/edit',
  ownerValidationRules(), // Apply validation rules
  validate('owners/createOrUpdateOwnerForm'), // Validate and handle errors, re-render form on failure
  ownerController.processUpdateOwnerForm
);

// Display owner details
router.get('/owners/:ownerId', ownerController.showOwner);

/**
 * Pet routes (nested under owner)
 */

// Route param middleware for petId (mimics @ModelAttribute("pet") in Spring)
// This will be called after ownerId param middleware
router.param('petId', petController.findPet);

// Middleware to populate pet types for pet forms (mimics @ModelAttribute("types") in Spring)
router.use('/owners/:ownerId/pets', petController.populatePetTypes);

// Display form for new pet
router.get('/owners/:ownerId/pets/new', petController.initCreationForm);

// Process form for new pet
router.post('/owners/:ownerId/pets/new',
  petValidationRules(), // Apply validation rules
  validate('pets/createOrUpdatePetForm'), // Validate and handle errors
  petController.processCreationForm
);

// Display form to edit existing pet
router.get('/owners/:ownerId/pets/:petId/edit', petController.initUpdateForm);

// Process form to update existing pet
router.post('/owners/:ownerId/pets/:petId/edit',
  petValidationRules(), // Apply validation rules
  validate('pets/createOrUpdatePetForm'), // Validate and handle errors
  petController.processUpdateForm
);

/**
 * Visit routes (nested under owner/pet)
 */

// Route param middleware for petId within visits (mimics @ModelAttribute("visit") in Spring for visit forms)
router.param('petId', visitController.loadPetWithVisit); // This will load pet and owner, and init a new visit

// Display form for new visit
router.get('/owners/:ownerId/pets/:petId/visits/new', visitController.initNewVisitForm);

// Process form for new visit
router.post('/owners/:ownerId/pets/:petId/visits/new',
  visitValidationRules(), // Apply validation rules
  validate('pets/createOrUpdateVisitForm'), // Validate and handle errors
  visitController.processNewVisitForm
);

/**
 * Vet routes
 */

// Display paginated list of vets (HTML)
router.get('/vets.html', vetController.showVetListHtml);

// Display list of vets (JSON)
router.get('/vets', vetController.showResourcesVetList);

/**
 * System routes
 */

// Welcome page
router.get('/', systemController.welcome);

// Trigger an error for demonstration
router.get('/oups', systemController.triggerException);

// Catch-all for 404 Not Found
router.use(errorHandler.handleNotFound);

module.exports = router;
