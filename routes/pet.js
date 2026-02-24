/**
 * Route handlers for Pet management.
 * Pets are nested under Owners in the URL structure.
 */
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Owner, Pet, PetType } = require('../models');

const petValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('birthDate').isDate().withMessage('Invalid date'),
    body('typeId').notEmpty().withMessage('Type is required')
];

// Common function to load owner and types
async function loadPetContext(req) {
    const owner = await Owner.findByPk(req.params.ownerId);
    const types = await PetType.findAll();
    return { owner, types };
}

// Init Creation Form
router.get('/owners/:ownerId/pets/new', async (req, res, next) => {
    try {
        const { owner, types } = await loadPetContext(req);
        if (!owner) return next(new Error('Owner not found'));

        res.render('pets/createOrUpdatePetForm', {
            menu: 'owners',
            owner: owner,
            types: types,
            pet: {},
            mode: 'create'
        });
    } catch (err) {
        next(err);
    }
});

// Process Creation Form
router.post('/owners/:ownerId/pets/new', petValidation, async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const { owner, types } = await loadPetContext(req);
            return res.render('pets/createOrUpdatePetForm', {
                menu: 'owners',
                owner: owner,
                types: types,
                pet: req.body,
                mode: 'create',
                errors: errors.mapped()
            });
        }

        // Check for duplicate name for this owner
        const existingPet = await Pet.findOne({
            where: {
                owner_id: req.params.ownerId,
                name: req.body.name
            }
        });

        if (existingPet) {
            const { owner, types } = await loadPetContext(req);
            return res.render('pets/createOrUpdatePetForm', {
                menu: 'owners',
                owner: owner,
                types: types,
                pet: req.body,
                mode: 'create',
                errors: { name: { msg: 'is already in use' } }
            });
        }

        await Pet.create({
            name: req.body.name,
            birthDate: req.body.birthDate,
            type_id: req.body.typeId,
            owner_id: req.params.ownerId
        });

        res.redirect(`/owners/${req.params.ownerId}`);
    } catch (err) {
        next(err);
    }
});

// Init Update Form
router.get('/owners/:ownerId/pets/:petId/edit', async (req, res, next) => {
    try {
        const { owner, types } = await loadPetContext(req);
        const pet = await Pet.findByPk(req.params.petId);
        
        if (!pet || !owner) return next(new Error('Data not found'));

        res.render('pets/createOrUpdatePetForm', {
            menu: 'owners',
            owner: owner,
            types: types,
            pet: {
                id: pet.id,
                name: pet.name,
                birthDate: pet.birthDate,
                typeId: pet.type_id
            },
            mode: 'update'
        });
    } catch (err) {
        next(err);
    }
});

// Process Update Form
router.post('/owners/:ownerId/pets/:petId/edit', petValidation, async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const { owner, types } = await loadPetContext(req);
            return res.render('pets/createOrUpdatePetForm', {
                menu: 'owners',
                owner: owner,
                types: types,
                pet: { ...req.body, id: req.params.petId },
                mode: 'update',
                errors: errors.mapped()
            });
        }

        await Pet.update({
            name: req.body.name,
            birthDate: req.body.birthDate,
            type_id: req.body.typeId
        }, {
            where: { id: req.params.petId }
        });

        res.redirect(`/owners/${req.params.ownerId}`);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
