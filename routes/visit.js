/**
 * Route handlers for Visits.
 */
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Owner, Pet, PetType } = require('../models');

const visitValidation = [
    body('date').isDate().withMessage('Invalid date'),
    body('description').trim().notEmpty().withMessage('Description is required')
];

// Helper to load context
async function loadVisitContext(req) {
    const pet = await Pet.findByPk(req.params.petId, {
        include: [
            { model: Owner },
            { model: PetType, as: 'type' },
            { model: require('../models').Visit, as: 'visits' } // Lazy load
        ]
    });
    return pet;
}

// Init New Visit Form
router.get('/owners/:ownerId/pets/:petId/visits/new', async (req, res, next) => {
    try {
        const pet = await loadVisitContext(req);
        if (!pet) return next(new Error('Pet not found'));

        res.render('pets/createOrUpdateVisitForm', {
            menu: 'owners',
            pet: pet,
            visit: { date: new Date().toISOString().split('T')[0] }, // Default to today
            mode: 'create'
        });
    } catch (err) {
        next(err);
    }
});

// Process New Visit Form
router.post('/owners/:ownerId/pets/:petId/visits/new', visitValidation, async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const pet = await loadVisitContext(req);
            return res.render('pets/createOrUpdateVisitForm', {
                menu: 'owners',
                pet: pet,
                visit: req.body,
                mode: 'create',
                errors: errors.mapped()
            });
        }

        const Visit = require('../models').Visit;
        await Visit.create({
            date: req.body.date,
            description: req.body.description,
            pet_id: req.params.petId
        });

        res.redirect(`/owners/${req.params.ownerId}`);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
