const { Owner, Pet, PetType } = require('../models');
const { body, validationResult } = require('express-validator');

// Helper to load Types
const getPetTypes = async () => {
  return await PetType.findAll();
};

exports.initCreationForm = async (req, res, next) => {
  try {
    const owner = await Owner.findByPk(req.params.ownerId);
    if (!owner) return res.status(404).send("Owner not found");
    
    const types = await getPetTypes();
    res.render('pets/createOrUpdatePetForm', { 
      pet: {}, 
      owner, 
      types,
      errors: null 
    });
  } catch (err) {
    next(err);
  }
};

exports.processCreationForm = [
  body('name').notEmpty().withMessage('is required'),
  body('birthDate').isDate().withMessage('invalid date'),
  body('typeId').notEmpty().withMessage('is required'),

  async (req, res, next) => {
    const { ownerId } = req.params;
    try {
      const owner = await Owner.findByPk(ownerId);
      const errors = validationResult(req);
      
      if (!errors.isEmpty()) {
        const types = await getPetTypes();
        return res.render('pets/createOrUpdatePetForm', { 
          pet: req.body, 
          owner, 
          types,
          errors: errors.mapped()
        });
      }

      await Pet.create({ ...req.body, ownerId });
      res.redirect(`/owners/${ownerId}`);
    } catch (err) {
      next(err);
    }
  }
];

exports.initUpdateForm = async (req, res, next) => {
  try {
    const pet = await Pet.findByPk(req.params.petId);
    const owner = await Owner.findByPk(req.params.ownerId);
    const types = await getPetTypes();
    
    res.render('pets/createOrUpdatePetForm', { 
      pet, 
      owner, 
      types,
      errors: null
    });
  } catch (err) {
    next(err);
  }
};

exports.processUpdateForm = [
  body('name').notEmpty().withMessage('is required'),
  body('birthDate').isDate().withMessage('invalid date'),
  body('typeId').notEmpty().withMessage('is required'),

  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      const { ownerId, petId } = req.params;

      if (!errors.isEmpty()) {
        const owner = await Owner.findByPk(ownerId);
        const types = await getPetTypes();
        // Hack to ensure ID is available for form action
        const petData = { ...req.body, id: petId }; 
        return res.render('pets/createOrUpdatePetForm', { 
          pet: petData, 
          owner, 
          types,
          errors: errors.mapped()
        });
      }

      await Pet.update(req.body, { where: { id: petId } });
      res.redirect(`/owners/${ownerId}`);
    } catch (err) {
      next(err);
    }
  }
];
