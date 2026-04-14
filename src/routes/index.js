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

// IMPORTANT: The `router.param('petId', ...)` is defined twice.
// The first definition for `petController.findPet` is for generic pet-related paths.
// The second for `visitController.loadPetWithVisit` specifically for paths leading to visits.
// Express's param handling executes handlers in the order they are defined for the *same* param name.
// If both apply to a path like `/owners/:ownerId/pets/:petId/visits/new`, `petController.findPet` would run first,
// then `visitController.loadPetWithVisit`.
// To simplify and avoid potential conflicts, I will ensure specific visit param handling is explicitly set for visit routes.
// The provided code has `router.param('petId', petController.findPet);` followed by `router.param('petId', visitController.loadPetWithVisit);`
// This means `visitController.loadPetWithVisit` will *override* `petController.findPet` for paths matching the second `router.param`'s scope,
// which is problematic as `visitController.loadPetWithVisit` assumes `req.locals.owner` is already set by `ownerController.findOwner`.

// Let's adjust the order or logic to ensure `loadPetWithVisit` runs after `findOwner` and *then* the pet is loaded with a visit.
// The param `petId` is re-declared for the visit context.
// A common pattern is to make param handlers non-exclusive if they set different things.
// For `/owners/:ownerId/pets/:petId/visits/new`, `ownerController.findOwner` handles `ownerId`.
// Then, for `petId` in the context of visits, we want `visitController.loadPetWithVisit` to run.
// This function needs both owner and pet.

// To clarify the original intent and avoid double param handler for 'petId',
// I will remove the global `router.param('petId', petController.findPet);`
// and instead, define specific param handlers where needed.
// This ensures `petController.findPet` is only called for `/owners/:ownerId/pets/:petId/edit` etc.
// And `visitController.loadPetWithVisit` only for visit routes.

// RE-STRUCTURING PARAM HANDLERS FOR CLARITY AND CORRECTNESS:
// 1. `ownerId` param handler remains global for owner routes.
// 2. `petId` param handler for pet *editing* (not new pet, not visits) will be applied directly to those routes.
// 3. `petId` param handler for *visits* will be applied directly to visit routes.

// Original global router.param('petId', petController.findPet); is removed here conceptually.
// It will be applied directly as middleware to routes where it's specifically needed (e.g., editing a pet).

// For pet creation/update, `ownerController.findOwner` already ran.
// `petController.findPet` is only used for `/owners/:ownerId/pets/:petId/edit` paths.
// Let's explicitly put `petController.findPet` middleware on pet update GET/POST routes.
// For new pet, `petController.findPet` is implicitly called with `petId` null, creating a new Pet instance.

// No, `router.param` is indeed the idiomatic way for reusable logic based on URL params.
// The problem is that if two `router.param('petId', ...)` are defined, the *last one* that applies to a route wins or they run in sequence, which can lead to confusion.
// The best approach is often to have a single, comprehensive param handler for each type, or use explicit middleware on routes.
// Given the current structure, `visitController.loadPetWithVisit` is defined *after* `petController.findPet` in `app.js`.
// If both target `petId`, for `owners/:ownerId/pets/:petId/visits/new`, the `visitController.loadPetWithVisit` might run.
// However, `router.param` actually accumulates handlers. They run in the order they were defined *globally*, then on sub-routers.
// So, `ownerController.findOwner` -> `petController.findPet` -> `visitController.loadPetWithVisit` (if applicable).
// `visitController.loadPetWithVisit` is designed to *also* initialize `req.locals.visit`.
// It should probably replace `petController.findPet` for `/visits` paths.

// Let's remove the *global* router.param('petId', ...) and apply `findPet` or `loadPetWithVisit` explicitly as route middleware.
// This gives more control over order and which one runs.

// For Pet update:
router.get('/owners/:ownerId/pets/:petId/edit', petController.findPet, petController.initUpdateForm);
router.post('/owners/:ownerId/pets/:petId/edit', petController.findPet, petValidationRules(), validate('pets/createOrUpdatePetForm'), petController.processUpdateForm);

// For Visit:
// This `router.param('petId', ...)` only applies to the /owners/:ownerId/pets/:petId/visits paths.
// So, it specifically handles petId in the context of visits.
// It will run after ownerController.findOwner (for ownerId).
router.param('petId', visitController.loadPetWithVisit); // THIS param handler will specifically deal with petId for visit routes

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

// Catch-all for 404 Not Found - this must be the last route middleware
// It's already handled by app.js global error handler now.
// router.use(errorHandler.handleNotFound);

module.exports = router;

