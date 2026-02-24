/**
 * Route handlers for Owner management.
 * Includes Find, List, Create, and Edit operations.
 */
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Owner, Pet, PetType, Visit } = require('../models');
const { Op } = require('sequelize');

// Validation rules
const ownerValidation = [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('address').trim().notEmpty().withMessage('Address is required'),
    body('city').trim().notEmpty().withMessage('City is required'),
    body('telephone').matches(/^\d{10}$/).withMessage('Telephone must be a 10-digit number')
];

// Init Find Form
router.get('/find', (req, res) => {
    res.render('owners/findOwners', {
        menu: 'owners',
        owner: {} // Empty object for form binding
    });
});

// Process Find Form (Search)
router.get('/', async (req, res, next) => {
    try {
        let lastName = req.query.lastName || '';
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const offset = (page - 1) * limit;

        const { count, rows } = await Owner.findAndCountAll({
            where: {
                lastName: {
                    [Op.like]: `${lastName}%` // Starts with
                }
            },
            include: [{ model: Pet, as: 'pets', include: ['type'] }],
            distinct: true, // Ensure correct count with includes
            limit: limit,
            offset: offset,
            order: [['lastName', 'ASC']]
        });

        if (count === 0) {
            return res.render('owners/findOwners', {
                menu: 'owners',
                owner: { lastName },
                errors: { lastName: { msg: 'has not been found' } }
            });
        }

        if (count === 1) {
            return res.redirect(`/owners/${rows[0].id}`);
        }

        res.render('owners/ownersList', {
            menu: 'owners',
            listOwners: rows,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            totalItems: count
        });

    } catch (err) {
        next(err);
    }
});

// Init Creation Form
router.get('/new', (req, res) => {
    res.render('owners/createOrUpdateOwnerForm', {
        menu: 'owners',
        owner: {},
        mode: 'create'
    });
});

// Process Creation Form
router.post('/new', ownerValidation, async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('owners/createOrUpdateOwnerForm', {
                menu: 'owners',
                owner: req.body,
                mode: 'create',
                errors: errors.mapped()
            });
        }

        const owner = await Owner.create(req.body);
        res.redirect(`/owners/${owner.id}`);
    } catch (err) {
        next(err);
    }
});

// Init Update Form
router.get('/:id/edit', async (req, res, next) => {
    try {
        const owner = await Owner.findByPk(req.params.id);
        if (!owner) return next(new Error('Owner not found'));

        res.render('owners/createOrUpdateOwnerForm', {
            menu: 'owners',
            owner: owner,
            mode: 'update'
        });
    } catch (err) {
        next(err);
    }
});

// Process Update Form
router.post('/:id/edit', ownerValidation, async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const owner = req.body;
            owner.id = req.params.id;
            return res.render('owners/createOrUpdateOwnerForm', {
                menu: 'owners',
                owner: owner,
                mode: 'update',
                errors: errors.mapped()
            });
        }

        await Owner.update(req.body, { where: { id: req.params.id } });
        res.redirect(`/owners/${req.params.id}`);
    } catch (err) {
        next(err);
    }
});

// Show Owner Details
router.get('/:id', async (req, res, next) => {
    try {
        const owner = await Owner.findByPk(req.params.id, {
            include: [{
                model: Pet,
                as: 'pets',
                include: [
                    { model: PetType, as: 'type' },
                    { model: Visit, as: 'visits' }
                ]
            }],
            order: [
                [{ model: Pet, as: 'pets' }, 'name', 'ASC'],
                [{ model: Pet, as: 'pets' }, { model: Visit, as: 'visits' }, 'visit_date', 'ASC']
            ]
        });

        if (!owner) return next(new Error('Owner not found'));

        res.render('owners/ownerDetails', {
            menu: 'owners',
            owner: owner
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
