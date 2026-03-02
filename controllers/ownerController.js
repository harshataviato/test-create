const { Owner, Pet, PetType, Visit } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

module.exports = {
    /**
     * Render the form to create a new owner
     */
    initCreationForm: (req, res) => {
        res.render('owners/createOrUpdateOwnerForm', { owner: {} });
    },

    /**
     * Handle the submission of the new owner form
     */
    processCreationForm: async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('owners/createOrUpdateOwnerForm', { 
                owner: req.body, 
                errors: errors.mapped() 
            });
        }

        try {
            const owner = await Owner.create(req.body);
            res.redirect(`/owners/${owner.id}`);
        } catch (err) {
            next(err);
        }
    },

    /**
     * Render form to find owners
     */
    initFindForm: (req, res) => {
        res.render('owners/findOwners', { owner: {}, errors: {} });
    },

    /**
     * Process the find owners form (search by last name)
     */
    processFindForm: async (req, res, next) => {
        try {
            const lastName = req.query.lastName || '';
            const page = parseInt(req.query.page) || 1;
            const limit = 5;
            const offset = (page - 1) * limit;

            const { count, rows } = await Owner.findAndCountAll({
                where: {
                    lastName: { [Op.like]: `${lastName}%` }
                },
                include: [{ model: Pet, as: 'pets' }],
                limit,
                offset
            });

            if (count === 0) {
                return res.render('owners/findOwners', { 
                    owner: { lastName }, 
                    errors: { lastName: { msg: 'has not been found' } } 
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
            next(err);
        }
    },

    /**
     * Show owner details
     */
    showOwner: async (req, res, next) => {
        try {
            const owner = await Owner.findByPk(req.params.ownerId, {
                include: [
                    { 
                        model: Pet, 
                        as: 'pets',
                        include: [
                            { model: PetType, as: 'type' },
                            { model: Visit, as: 'visits' }
                        ]
                    }
                ]
            });

            if (!owner) return next(new Error('Owner not found'));

            res.render('owners/ownerDetails', { owner });
        } catch (err) {
            next(err);
        }
    },

    /**
     * Init update form
     */
    initUpdateOwnerForm: async (req, res, next) => {
        try {
            const owner = await Owner.findByPk(req.params.ownerId);
            if (!owner) return next(new Error('Owner not found'));
            res.render('owners/createOrUpdateOwnerForm', { owner });
        } catch (err) {
            next(err);
        }
    },

    /**
     * Process update form
     */
    processUpdateOwnerForm: async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const owner = req.body;
            owner.id = req.params.ownerId; // Keep ID for form action URL
            return res.render('owners/createOrUpdateOwnerForm', { 
                owner, 
                errors: errors.mapped() 
            });
        }

        try {
            await Owner.update(req.body, { where: { id: req.params.ownerId } });
            res.redirect(`/owners/${req.params.ownerId}`);
        } catch (err) {
            next(err);
        }
    }
};
