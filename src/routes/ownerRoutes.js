/**
 * Owner Routes Configuration
 * Includes paths for Owners, Pets, and Visits as they are nested resources.
 */
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const ownerController = require('../controllers/ownerController');
const petController = require('../controllers/petController');
const visitController = require('../controllers/visitController');

// Owner Validation Rules
const ownerValidation = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('telephone').matches(/\d{10}/).withMessage('Telephone must be a 10-digit number')
];

// Pet Validation Rules
const petValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('birthDate').isDate().withMessage('Invalid date format'),
  body('typeId').notEmpty().withMessage('Type is required')
];

// Visit Validation Rules
const visitValidation = [
  body('date').isDate().withMessage('Date is required'),
  body('description').notEmpty().withMessage('Description is required')
];

// --- Owner Routes ---
router.get('/new', ownerController.initCreationForm);
router.post('/new', ownerValidation, ownerController.processCreationForm);
router.get('/find', ownerController.initFindForm);
router.get('/', ownerController.processFindForm);
router.get('/:ownerId', ownerController.showOwner);
router.get('/:ownerId/edit', ownerController.initUpdateOwnerForm);
router.post('/:ownerId/edit', ownerValidation, ownerController.processUpdateOwnerForm);

// --- Pet Routes (Nested under Owner) ---
router.get('/:ownerId/pets/new', petController.initCreationForm);
router.post('/:ownerId/pets/new', petValidation, petController.processCreationForm);
router.get('/:ownerId/pets/:petId/edit', petController.initUpdateForm);
router.post('/:ownerId/pets/:petId/edit', petValidation, petController.processUpdateForm);

// --- Visit Routes (Nested under Owner -> Pet) ---
router.get('/:ownerId/pets/:petId/visits/new', visitController.initNewVisitForm);
router.post('/:ownerId/pets/:petId/visits/new', visitValidation, visitController.processNewVisitForm);

module.exports = router;
