/**
 * Router Definitions.
 * 
 * Defines all application routes and applies specific validators.
 * Uses express-validator for Form Validation requirement.
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const vetController = require('../controllers/vetController');
const ownerController = require('../controllers/ownerController');
const petController = require('../controllers/petController');

// --- Home ---
router.get('/', (req, res) => res.render('home'));

// --- Error Trigger Demo ---
router.get('/crash', (req, res) => {
  throw new Error('This is a demonstration of the Global Error Handler.');
});

// --- Vets ---
router.get('/vets', vetController.getVets);

// --- Owners ---
// Validators
const ownerValidators = [
  body('firstName').trim().notEmpty().withMessage('First Name is required'),
  body('lastName').trim().notEmpty().withMessage('Last Name is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('telephone').trim().isNumeric().isLength({ min: 10, max: 10 }).withMessage('Telephone must be 10 digits')
];

router.get('/owners/find', ownerController.findOwnerForm);
router.get('/owners', ownerController.processFindForm);
router.get('/owners/new', ownerController.newOwnerForm);
router.post('/owners/new', ownerValidators, ownerController.processCreation);
router.get('/owners/:id', ownerController.showOwner);
router.get('/owners/:id/edit', ownerController.editOwnerForm);
router.post('/owners/:id/edit', ownerValidators, ownerController.processUpdate);

// --- Pets ---
const petValidators = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('birthDate').isDate().withMessage('Valid Birth Date required'),
  body('type').notEmpty().withMessage('Type is required')
];

router.get('/owners/:ownerId/pets/new', petController.newPetForm);
router.post('/owners/:ownerId/pets/new', petValidators, petController.processNewPet);

// --- Visits ---
const visitValidators = [
  body('date').isDate().withMessage('Date is required'),
  body('description').trim().notEmpty().withMessage('Description is required')
];

router.get('/owners/*/pets/:petId/visits/new', petController.newVisitForm);
router.post('/owners/*/pets/:petId/visits/new', visitValidators, petController.processNewVisit);

module.exports = router;
