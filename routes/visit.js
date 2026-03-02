const express = require('express');
const router = express.Router({ mergeParams: true });
const { Pet, Visit, Owner, PetType } = require('../models');

/**
 * VisitController implementation.
 */

// Middleware to load Pet data
const loadPet = async (req, res, next) => {
    const pet = await Pet.findByPk(req.params.petId, {
        include: [{ model: Visit, as: 'visits' }, { model: Owner, as: 'owner' }, { model: PetType, as: 'type' }]
    });
    if (!pet) return res.status(404).send('Pet not found');
    req.pet = pet;
    next();
};

// GET /owners/*/pets/*/visits/new
router.get('/new', loadPet, (req, res) => {
    res.render('pets/createOrUpdateVisitForm', { 
        pet: req.pet, 
        visit: {}, 
        errors: null 
    });
});

// POST /owners/*/pets/*/visits/new
router.post('/new', loadPet, async (req, res) => {
    try {
        await Visit.create({
            date: req.body.date,
            description: req.body.description,
            petId: req.pet.id
        });
        req.flash('success_msg', 'Your visit has been booked');
        res.redirect(`/owners/${req.params.ownerId}`);
    } catch (err) {
        let errors = {};
        if (err.name === 'SequelizeValidationError') {
            err.errors.forEach(e => errors[e.path] = e.message);
        }
        res.render('pets/createOrUpdateVisitForm', { 
            pet: req.pet, 
            visit: req.body, 
            errors 
        });
    }
});

module.exports = router;
