const { Owner, Pet, Visit, PetType } = require('../models');
const { validationResult } = require('express-validator');

module.exports = {
    initNewVisitForm: async (req, res, next) => {
        try {
            const pet = await Pet.findByPk(req.params.petId, {
                include: [
                    { model: Visit, as: 'visits' },
                    { model: PetType, as: 'type' }
                ]
            });
            const owner = await Owner.findByPk(req.params.ownerId);

            res.render('pets/createOrUpdateVisitForm', {
                pet,
                owner,
                visit: {}
            });
        } catch (err) {
            next(err);
        }
    },

    processNewVisitForm: async (req, res, next) => {
        try {
            const pet = await Pet.findByPk(req.params.petId, {
                include: [
                    { model: Visit, as: 'visits' },
                    { model: PetType, as: 'type' }
                ]
            });
            const owner = await Owner.findByPk(req.params.ownerId);

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.render('pets/createOrUpdateVisitForm', {
                    pet,
                    owner,
                    visit: req.body,
                    errors: errors.mapped()
                });
            }

            await Visit.create({
                date: req.body.date,
                description: req.body.description,
                pet_id: pet.id
            });

            res.redirect(`/owners/${owner.id}`);
        } catch (err) {
            next(err);
        }
    }
};
