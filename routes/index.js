const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');
const vetController = require('../controllers/vetController');
const petController = require('../controllers/petController');
const visitController = require('../controllers/visitController');
const { body } = require('express-validator');

// Welcome Page
router.get('/', (req, res) => {
    res.render('welcome');
});

// Error simulation
router.get('/oups', (req, res) => {
    throw new Error("Expected: controller used to showcase what happens when an exception is thrown");
});

// --- Owner Routes ---
router.get('/owners/find', ownerController.initFindForm);
router.get('/owners', ownerController.processFindForm);

router.get('/owners/new', ownerController.initCreationForm);
router.post('/owners/new', [
    body('firstName').trim().notEmpty().withMessage('is required'),
    body('lastName').trim().notEmpty().withMessage('is required'),
    body('address').trim().notEmpty().withMessage('is required'),
    body('city').trim().notEmpty().withMessage('is required'),
    body('telephone').matches(/\d{10}/).withMessage('Telephone must be a 10-digit number')
], ownerController.processCreationForm);

router.get('/owners/:ownerId', ownerController.showOwner);

router.get('/owners/:ownerId/edit', ownerController.initUpdateOwnerForm);
router.post('/owners/:ownerId/edit', [
    body('firstName').trim().notEmpty().withMessage('is required'),
    body('lastName').trim().notEmpty().withMessage('is required'),
    body('address').trim().notEmpty().withMessage('is required'),
    body('city').trim().notEmpty().withMessage('is required'),
    body('telephone').matches(/\d{10}/).withMessage('Telephone must be a 10-digit number')
], ownerController.processUpdateOwnerForm);

// --- Pet Routes ---
router.get('/owners/:ownerId/pets/new', petController.initCreationForm);
router.post('/owners/:ownerId/pets/new', [
    body('name').trim().notEmpty().withMessage('is required'),
    body('birthDate').isDate().withMessage('invalid date'),
    body('type').notEmpty().withMessage('is required')
], petController.processCreationForm);

router.get('/owners/:ownerId/pets/:petId/edit', petController.initUpdateForm);
router.post('/owners/:ownerId/pets/:petId/edit', [
    body('name').trim().notEmpty().withMessage('is required'),
    body('birthDate').isDate().withMessage('invalid date'),
    body('type').notEmpty().withMessage('is required')
], petController.processUpdateForm);

// --- Visit Routes ---
router.get('/owners/:ownerId/pets/:petId/visits/new', visitController.initNewVisitForm);
router.post('/owners/:ownerId/pets/:petId/visits/new', [
    body('date').isDate().withMessage('invalid date'),
    body('description').trim().notEmpty().withMessage('is required')
], visitController.processNewVisitForm);

// --- Vet Routes ---
router.get('/vets.html', vetController.showVetList);
router.get('/vets', vetController.getVetsJson);

module.exports = router;
