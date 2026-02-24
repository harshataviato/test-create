const { Owner, Pet, PetType } = require('../models');
const { validationResult } = require('express-validator');

module.exports = {
  
  // Middleware to load types for form select
  populatePetTypes: async (req, res, next) => {
    try {
      res.locals.types = (await PetType.findAll()).map(t => t.name);
      next();
    } catch (err) { next(err); }
  },

  // Middleware to find owner
  findOwner: async (req, res, next, ownerId) => {
    try {
      const owner = await Owner.findByPk(ownerId);
      if (!owner) return next(new Error('Owner not found'));
      req.owner = owner;
      res.locals.owner = owner.toJSON();
      next();
    } catch (err) { next(err); }
  },

  // GET /owners/:ownerId/pets/new
  initCreationForm: (req, res) => {
    res.render('pets/createOrUpdatePetForm', { pet: { new: true } });
  },

  // POST /owners/:ownerId/pets/new
  processCreationForm: async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('pets/createOrUpdatePetForm', {
        pet: { ...req.body, new: true },
        errors: errors.mapped()
      });
    }

    try {
      const type = await PetType.findOne({ where: { name: req.body.type } });
      await Pet.create({
        name: req.body.name,
        birthDate: req.body.birthDate,
        ownerId: req.owner.id,
        typeId: type.id
      });
      res.redirect(`/owners/${req.owner.id}`);
    } catch (err) {
      next(err);
    }
  },

  // GET /owners/:ownerId/pets/:petId/edit
  initUpdateForm: async (req, res, next) => {
    try {
      const pet = await Pet.findByPk(req.params.petId, { include: 'type' });
      const petJson = pet.toJSON();
      // Adjust structure to match view expectation for select
      petJson.type = pet.type.name; 
      res.render('pets/createOrUpdatePetForm', { pet: petJson });
    } catch (err) { next(err); }
  },

  // POST /owners/:ownerId/pets/:petId/edit
  processUpdateForm: async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('pets/createOrUpdatePetForm', {
        pet: { ...req.body, id: req.params.petId },
        errors: errors.mapped()
      });
    }

    try {
      const type = await PetType.findOne({ where: { name: req.body.type } });
      await Pet.update({
        name: req.body.name,
        birthDate: req.body.birthDate,
        typeId: type.id
      }, { where: { id: req.params.petId } });
      res.redirect(`/owners/${req.owner.id}`);
    } catch (err) { next(err); }
  }
};
