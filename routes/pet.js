const express = require('express');
const router = express.Router({ mergeParams: true }); // Access parent params (ownerId)
const { Owner, Pet, PetType } = require('../models');

/**
 * PetController implementation.
 */

// GET /owners/:ownerId/pets/new
router.get('/new', async (req, res) => {
    const owner = await Owner.findByPk(req.params.ownerId);
    const types = await PetType.findAll();
    res.render('pets/createOrUpdatePetForm', { 
        pet: {}, 
        owner, 
        types, 
        errors: null 
    });
});

// POST /owners/:ownerId/pets/new
router.post('/new', async (req, res) => {
    const ownerId = req.params.ownerId;
    try {
        // Business Rule: Check for duplicate name
        const existingPet = await Pet.findOne({ where: { name: req.body.name, ownerId: ownerId }});
        if (existingPet) {
            throw { name: 'SequelizeValidationError', errors: [{ path: 'name', message: 'is already in use' }] };
        }

        const type = await PetType.findOne({ where: { name: req.body.type }});
        
        await Pet.create({
            name: req.body.name,
            birthDate: req.body.birthDate,
            typeId: type.id,
            ownerId: ownerId
        });

        req.flash('success_msg', 'New Pet has been Added');
        res.redirect(`/owners/${ownerId}`);
    } catch (err) {
        const owner = await Owner.findByPk(ownerId);
        const types = await PetType.findAll();
        let errors = {};
        
        if (err.name === 'SequelizeValidationError') {
            err.errors.forEach(e => errors[e.path] = e.message);
        }
        
        res.render('pets/createOrUpdatePetForm', { 
            pet: req.body, 
            owner, 
            types, 
            errors 
        });
    }
});

// GET /owners/:ownerId/pets/:petId/edit
router.get('/:petId/edit', async (req, res) => {
    const pet = await Pet.findByPk(req.params.petId, { include: ['type'] });
    const owner = await Owner.findByPk(req.params.ownerId);
    const types = await PetType.findAll();
    
    // Flatten pet type name for the form select
    const petData = pet.toJSON();
    petData.type = pet.type.name;

    res.render('pets/createOrUpdatePetForm', { 
        pet: petData, 
        owner, 
        types, 
        errors: null 
    });
});

// POST /owners/:ownerId/pets/:petId/edit
router.post('/:petId/edit', async (req, res) => {
    try {
        const type = await PetType.findOne({ where: { name: req.body.type }});
        
        await Pet.update({
            name: req.body.name,
            birthDate: req.body.birthDate,
            typeId: type.id
        }, { where: { id: req.params.petId }});

        req.flash('success_msg', 'Pet details has been edited');
        res.redirect(`/owners/${req.params.ownerId}`);
    } catch (err) {
        const owner = await Owner.findByPk(req.params.ownerId);
        const types = await PetType.findAll();
        let errors = {};
        if (err.name === 'SequelizeValidationError') {
            err.errors.forEach(e => errors[e.path] = e.message);
        }
        
        const petData = { ...req.body, id: req.params.petId };
        
        res.render('pets/createOrUpdatePetForm', { 
            pet: petData, 
            owner, 
            types, 
            errors 
        });
    }
});

module.exports = router;
