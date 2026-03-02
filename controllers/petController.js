const { Owner, Pet, PetType } = require('../models');
const { validationResult } = require('express-validator');

module.exports = {
    /**
     * Prepare data for pet form
     */
    populatePetTypes: async () => {
        return await PetType.findAll();
    },

    initCreationForm: async (req, res, next) => {
        try {
            const owner = await Owner.findByPk(req.params.ownerId);
            const types = await PetType.findAll();
            if (!owner) return next(new Error("Owner not found"));
            
            res.render('pets/createOrUpdatePetForm', {
                pet: {},
                owner,
                types
            });
        } catch (err) {
            next(err);
        }
    },

    processCreationForm: async (req, res, next) => {
        try {
            const owner = await Owner.findByPk(req.params.ownerId);
            const types = await PetType.findAll();
            
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.render('pets/createOrUpdatePetForm', {
                    pet: req.body,
                    owner,
                    types,
                    errors: errors.mapped()
                });
            }

            const petType = await PetType.findOne({ where: { name: req.body.type } });
            
            await Pet.create({
                ...req.body,
                owner_id: owner.id,
                type_id: petType.id
            });

            res.redirect(`/owners/${owner.id}`);
        } catch (err) {
            next(err);
        }
    },

    initUpdateForm: async (req, res, next) => {
        try {
            const owner = await Owner.findByPk(req.params.ownerId);
            const types = await PetType.findAll();
            const pet = await Pet.findByPk(req.params.petId, {
                include: [{ model: PetType, as: 'type' }]
            });

            // Flatten type for the form selector
            const petData = pet.toJSON();
            if(petData.type) petData.type = petData.type.name;

            res.render('pets/createOrUpdatePetForm', {
                pet: petData,
                owner,
                types
            });
        } catch (err) {
            next(err);
        }
    },

    processUpdateForm: async (req, res, next) => {
        try {
            const owner = await Owner.findByPk(req.params.ownerId);
            const types = await PetType.findAll();
            
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const petData = req.body;
                petData.id = req.params.petId; 
                return res.render('pets/createOrUpdatePetForm', {
                    pet: petData,
                    owner,
                    types,
                    errors: errors.mapped()
                });
            }

            const petType = await PetType.findOne({ where: { name: req.body.type } });

            await Pet.update({
                name: req.body.name,
                birthDate: req.body.birthDate,
                type_id: petType.id
            }, {
                where: { id: req.params.petId }
            });

            res.redirect(`/owners/${owner.id}`);
        } catch (err) {
            next(err);
        }
    }
};
