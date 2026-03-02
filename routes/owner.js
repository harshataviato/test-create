const express = require('express');
const router = express.Router();
const { Owner, Pet, PetType, Visit } = require('../models');
const { Op } = require('sequelize');

/**
 * OwnerController implementation.
 */

// GET /owners/find - Initialize Find Form
router.get('/find', (req, res) => {
    res.render('owners/findOwners', { owner: {} });
});

// GET /owners - Process Find Form
router.get('/', async (req, res) => {
    let lastName = req.query.lastName || '';
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    try {
        const { count, rows } = await Owner.findAndCountAll({
            where: {
                lastName: { [Op.like]: `${lastName}%` }
            },
            include: [{ model: Pet, as: 'pets' }],
            limit: limit,
            offset: offset,
            distinct: true // Important for correct count with includes
        });

        if (count === 0) {
            return res.render('owners/findOwners', { 
                owner: { lastName }, 
                errors: { lastName: 'has not been found' } 
            });
        }

        if (count === 1) {
            return res.redirect(`/owners/${rows[0].id}`);
        }

        res.render('owners/ownersList', {
            listOwners: rows,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            totalItems: count
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// GET /owners/new - Init Creation Form
router.get('/new', (req, res) => {
    res.render('owners/createOrUpdateOwnerForm', { owner: {}, errors: null });
});

// POST /owners/new - Process Creation Form
router.post('/new', async (req, res) => {
    try {
        const owner = await Owner.create(req.body);
        req.flash('success_msg', 'New Owner Created');
        res.redirect(`/owners/${owner.id}`);
    } catch (err) {
        if (err.name === 'SequelizeValidationError') {
            const errors = {};
            err.errors.forEach(e => errors[e.path] = e.message);
            return res.render('owners/createOrUpdateOwnerForm', { owner: req.body, errors });
        }
        throw err;
    }
});

// GET /owners/:ownerId - Show Owner
router.get('/:ownerId', async (req, res) => {
    try {
        const owner = await Owner.findByPk(req.params.ownerId, {
            include: [{
                model: Pet, 
                as: 'pets',
                include: [{ model: Visit, as: 'visits' }, { model: PetType, as: 'type' }]
            }],
            order: [[ { model: Pet, as: 'pets' }, 'name', 'ASC' ]]
        });

        if (!owner) throw new Error("Owner not found");

        res.render('owners/ownerDetails', { owner });
    } catch (err) {
        res.status(404).send('Owner not found');
    }
});

// GET /owners/:ownerId/edit - Init Update Form
router.get('/:ownerId/edit', async (req, res) => {
    const owner = await Owner.findByPk(req.params.ownerId);
    res.render('owners/createOrUpdateOwnerForm', { owner, errors: null });
});

// POST /owners/:ownerId/edit - Process Update Form
router.post('/:ownerId/edit', async (req, res) => {
    try {
        await Owner.update(req.body, { where: { id: req.params.ownerId } });
        req.flash('success_msg', 'Owner Values Updated');
        res.redirect(`/owners/${req.params.ownerId}`);
    } catch (err) {
        if (err.name === 'SequelizeValidationError') {
            const errors = {};
            err.errors.forEach(e => errors[e.path] = e.message);
            // Re-attach ID for the form action URL
            const owner = { ...req.body, id: req.params.ownerId };
            return res.render('owners/createOrUpdateOwnerForm', { owner, errors });
        }
        throw err;
    }
});

module.exports = router;
