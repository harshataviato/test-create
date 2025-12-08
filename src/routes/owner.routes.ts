/**
 * @module routes/owner.routes
 * @description Defines API routes for `Owner` and `Pet` entities,
 *              mapping them to `OwnerController` and `PetController` methods.
 *              Mimics Spring's `OwnerController.java`, `PetController.java`, `VisitController.java`.
 */

import { Router } from 'express';
import { ownerController } from '@controllers/owner/OwnerController';
import { petController } from '@controllers/owner/PetController';
import { visitController } from '@controllers/owner/VisitController';
import flash from 'connect-flash'; // For flash messages, similar to RedirectAttributes

const ownerRouter = Router();

// Enable flash messages for all owner routes
ownerRouter.use(flash());

/**
 * Owner Routes
 * Corresponds to OwnerController.java
 */
ownerRouter.get('/owners/new', ownerController.initCreationForm);
ownerRouter.post('/owners/new', ownerController.processCreationForm);
ownerRouter.get('/owners/find', ownerController.initFindForm);
ownerRouter.get('/owners', ownerController.processFindForm); // Handles search and list views
ownerRouter.get('/owners/:ownerId/edit', ownerController.initUpdateOwnerForm);
ownerRouter.post('/owners/:ownerId/edit', ownerController.processUpdateOwnerForm);
ownerRouter.get('/owners/:ownerId', ownerController.showOwner);

/**
 * Pet Routes (nested under /owners/:ownerId)
 * Corresponds to PetController.java
 */
ownerRouter.use(
  '/owners/:ownerId/pets',
  petController.findOwner, // Middleware to load owner for all nested pet routes
  petController.populatePetTypes // Middleware to load pet types for all nested pet routes
);

ownerRouter.get('/owners/:ownerId/pets/new', petController.initCreationForm);
ownerRouter.post('/owners/:ownerId/pets/new', petController.processCreationForm);
ownerRouter.get('/owners/:ownerId/pets/:petId/edit', petController.findPet, petController.initUpdateForm);
ownerRouter.post('/owners/:ownerId/pets/:petId/edit', petController.findPet, petController.processUpdateForm);

/**
 * Visit Routes (nested under /owners/:ownerId/pets/:petId)
 * Corresponds to VisitController.java
 */
ownerRouter.use(
  '/owners/:ownerId/pets/:petId/visits',
  visitController.loadPetWithVisit // Middleware to load owner, pet, and create new visit
);

ownerRouter.get('/owners/:ownerId/pets/:petId/visits/new', visitController.initNewVisitForm);
ownerRouter.post('/owners/:ownerId/pets/:petId/visits/new', visitController.processNewVisitForm);

export default ownerRouter;
