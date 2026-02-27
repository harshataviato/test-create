const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Owner, Pet, PetType, Visit } = require('../db/models');
const { Op } = require('sequelize');

/**
 * Controller logic for Owner related requests
 */

// Search Owners Form
router.get('/find', (req, res) => {
    res.render('owners/findOwners', { owner: {}, menu: 'owners' });
});

// List or Single Owner Results
router.get('/', async (req, res) => {
    const lastName = req.query.lastName || '';
    const owners = await Owner.findAll({
        where: { lastName: { [Op.like]: `${lastName}%` } },
        include: [{ model: Pet, include: [PetType] }]
    });

    if (owners.length === 0) {
        return res.render('owners/findOwners', { owner: { lastName }, menu: 'owners', errors: [{ msg: 'has not been found' }] });
    } else if (owners.length === 1) {
        return res.redirect(`/owners/${owners[0].id}`);
    } else {
        res.render('owners/ownersList', { listOwners: owners, menu: 'owners' });
    }
});

// New Owner Form
router.get('/new', (req, res) => {
    res.render('owners/createOrUpdateOwnerForm', { owner: {}, menu: 'owners' });
});

// Create Owner
router.post('/new', [
    body('firstName').notEmpty(),
    body('lastName').notEmpty(),
    body('address').notEmpty(),
    body('city').notEmpty(),
    body('telephone').isNumeric().isLength({ min: 10, max: 10 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('owners/createOrUpdateOwnerForm', { owner: req.body, menu: 'owners', errors: errors.array() });
    }
    const owner = await Owner.create(req.body);
    res.redirect(`/owners/${owner.id}`);
});

// Owner Details
router.get('/:id', async (req, res) => {
    const owner = await Owner.findByPk(req.params.id, {
        include: [{ model: Pet, include: [PetType, Visit] }]
    });
    res.render('owners/ownerDetails', { owner, menu: 'owners' });
});

// Edit Owner
router.get('/:id/edit', async (req, res) => {
    const owner = await Owner.findByPk(req.params.id);
    res.render('owners/createOrUpdateOwnerForm', { owner, menu: 'owners' });
});

router.post('/:id/edit', async (req, res) => {
    await Owner.update(req.body, { where: { id: req.params.id } });
    res.redirect(`/owners/${req.params.id}`);
});

// --- Pet Sub-routes ---

router.get('/:ownerId/pets/new', async (req, res) => {
    const owner = await Owner.findByPk(req.params.ownerId);
    const types = await PetType.findAll();
    res.render('pets/createOrUpdatePetForm', { owner, pet: {}, types, menu: 'owners' });
});

router.post('/:ownerId/pets/new', async (req, res) => {
    await Pet.create({ ...req.body, ownerId: req.params.ownerId, typeId: req.body.type });
    res.redirect(`/owners/${req.params.ownerId}`);
});

router.get('/:ownerId/pets/:petId/edit', async (req, res) => {
    const owner = await Owner.findByPk(req.params.ownerId);
    const pet = await Pet.findByPk(req.params.petId);
    const types = await PetType.findAll();
    res.render('pets/createOrUpdatePetForm', { owner, pet, types, menu: 'owners' });
});

router.post('/:ownerId/pets/:petId/edit', async (req, res) => {
    await Pet.update({ ...req.body, typeId: req.body.type }, { where: { id: req.params.petId } });
    res.redirect(`/owners/${req.params.ownerId}`);
});

// --- Visit Sub-routes ---

router.get('/:ownerId/pets/:petId/visits/new', async (req, res) => {
    const pet = await Pet.findByPk(req.params.petId, { include: [Owner, Visit, PetType] });
    res.render('pets/createOrUpdateVisitForm', { owner: pet.owner, pet, visit: {}, menu: 'owners' });
});

router.post('/:ownerId/pets/:petId/visits/new', async (req, res) => {
    await Visit.create({ ...req.body, petId: req.params.petId });
    res.redirect(`/owners/${req.params.ownerId}`);
});

module.exports = router;
