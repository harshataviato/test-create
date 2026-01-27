/**
 * @fileoverview Main router for the PetClinic application.
 * This file aggregates all sub-routers and defines top-level routes.
 */

const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const i18n = require('../config/i18n'); // Import custom i18n setup

// Import controllers
const indexController = require('../controllers/indexController');
const ownerController = require('../controllers/ownerController');
const petController = require('../controllers/petController');
const visitController = require('../controllers/visitController');
const vetController = require('../controllers/vetController');

// --- Global Middleware for locale (after session and flash) ---
// This ensures req.__ and req.__n are correctly bound and locale is set for views
router.use(i18n.setLocale);

// --- Index Routes ---
router.get('/', indexController.home);
router.get('/oups', indexController.oups);
router.get('/locale', indexController.changeLocale); // Change locale via query param

// --- Owners Routes ---
router.get('/owners', ownerController.index); // Redirect to find form
router.get('/owners/find', ownerController.find);
router.post(
  '/owners/find',
  body('lastName').trim().notEmpty().withMessage((value, { req }) => req.__('owner.lastName.notEmpty')),
  ownerController.processFindForm
);
router.get('/owners/new', ownerController.newOwnerForm);
router.post(
  '/owners/new',
  [
    body('firstName').trim().notEmpty().withMessage((value, { req }) => req.__('person.firstName.notEmpty')),
    body('lastName').trim().notEmpty().withMessage((value, { req }) => req.__('person.lastName.notEmpty')),
    body('address').trim().notEmpty().withMessage((value, { req }) => req.__('owner.address.notEmpty')),
    body('city').trim().notEmpty().withMessage((value, { req }) => req.__('owner.city.notEmpty')),
    body('telephone').trim().notEmpty().withMessage((value, { req }) => req.__('owner.telephone.notEmpty'))
      .matches(/^(\d{10})$/).withMessage((value, { req }) => req.__('owner.telephone.invalid'))
  ],
  ownerController.create
);
router.get('/owners/:ownerId', ownerController.show);
router.get('/owners/:ownerId/edit', ownerController.editOwnerForm);
router.post(
  '/owners/:ownerId/edit',
  [
    body('firstName').trim().notEmpty().withMessage((value, { req }) => req.__('person.firstName.notEmpty')),
    body('lastName').trim().notEmpty().withMessage((value, { req }) => req.__('person.lastName.notEmpty')),
    body('address').trim().notEmpty().withMessage((value, { req }) => req.__('owner.address.notEmpty')),
    body('city').trim().notEmpty().withMessage((value, { req }) => req.__('owner.city.notEmpty')),
    body('telephone').trim().notEmpty().withMessage((value, { req }) => req.__('owner.telephone.notEmpty'))
      .matches(/^(\d{10})$/).withMessage((value, { req }) => req.__('owner.telephone.invalid'))
  ],
  ownerController.update
);

// --- Pet Routes for a specific Owner ---
router.get('/owners/:ownerId/pets/new', petController.newPetForm);
router.post(
  '/owners/:ownerId/pets/new',
  [
    body('name').trim().notEmpty().withMessage((value, { req }) => req.__('pet.name.notEmpty')),
    body('birthDate').isISO8601().toDate().withMessage((value, { req }) => req.__('pet.birthDate.invalid')),
    body('type_id').isInt({ min: 1 }).withMessage((value, { req }) => req.__('pet.type.notEmpty'))
  ],
  petController.create
);
router.get('/owners/:ownerId/pets/:petId/edit', petController.editPetForm);
router.post(
  '/owners/:ownerId/pets/:petId/edit',
  [
    body('name').trim().notEmpty().withMessage((value, { req }) => req.__('pet.name.notEmpty')),
    body('birthDate').isISO8601().toDate().withMessage((value, { req }) => req.__('pet.birthDate.invalid')),
    body('type_id').isInt({ min: 1 }).withMessage((value, { req }) => req.__('pet.type.notEmpty'))
  ],
  petController.update
);

// --- Visit Routes for a specific Pet ---
router.get('/owners/:ownerId/pets/:petId/visits/new', visitController.newVisitForm);
router.post(
  '/owners/:ownerId/pets/:petId/visits/new',
  [
    body('date').isISO8601().toDate().withMessage((value, { req }) => req.__('visit.date.invalid')),
    body('description').trim().notEmpty().withMessage((value, { req }) => req.__('visit.description.notEmpty'))
  ],
  visitController.create
);
router.get('/owners/:ownerId/pets/:petId/visits', visitController.listByPet);


// --- Vets Routes ---
router.get('/vets', vetController.index);
router.get('/vets.json', vetController.listVetsApi); // JSON API endpoint


module.exports = router;

