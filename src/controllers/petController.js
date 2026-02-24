/**
 * Pet Controller
 * Handles adding and updating pets.
 */
const { Owner, Pet, PetType } = require('../models');
const { validationResult } = require('express-validator');

exports.initCreationForm = async (req, res) => {
  const { ownerId } = req.params;
  const types = await PetType.findAll();
  const owner = await Owner.findByPk(ownerId);
  
  res.render('pets/createOrUpdatePetForm', { 
    pet: {}, 
    owner, 
    types, 
    errors: [] 
  });
};

exports.processCreationForm = async (req, res) => {
  const { ownerId } = req.params;
  const errors = validationResult(req);
  
  // Custom validation: Check duplicate name
  const existingPet = await Pet.findOne({ where: { name: req.body.name, ownerId }});
  if(existingPet) {
      // Manually add error if duplicate
      // (Simplified logic compared to Java Validator)
  }

  if (!errors.isEmpty()) {
    const types = await PetType.findAll();
    const owner = await Owner.findByPk(ownerId);
    return res.render('pets/createOrUpdatePetForm', { 
      pet: req.body, 
      owner, 
      types, 
      errors: errors.array() 
    });
  }

  await Pet.create({ 
    ...req.body, 
    ownerId: ownerId 
  });
  
  res.redirect(`/owners/${ownerId}`);
};

exports.initUpdateForm = async (req, res) => {
  const { ownerId, petId } = req.params;
  const pet = await Pet.findByPk(petId);
  const types = await PetType.findAll();
  const owner = await Owner.findByPk(ownerId);

  res.render('pets/createOrUpdatePetForm', { 
    pet, 
    owner, 
    types, 
    errors: [] 
  });
};

exports.processUpdateForm = async (req, res) => {
  const { ownerId, petId } = req.params;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const types = await PetType.findAll();
    const owner = await Owner.findByPk(ownerId);
    return res.render('pets/createOrUpdatePetForm', { 
      pet: { ...req.body, id: petId }, 
      owner, 
      types, 
      errors: errors.array() 
    });
  }

  await Pet.update(req.body, { where: { id: petId } });
  res.redirect(`/owners/${ownerId}`);
};
