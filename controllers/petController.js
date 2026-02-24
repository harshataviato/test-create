import { Owner, Pet, PetType } from '../models/index.js';
import { body, validationResult } from 'express-validator';

export const validatePet = [
  body('name').notEmpty().withMessage('Name is required'),
  body('birthDate').isDate().withMessage('Invalid Birth Date'),
  body('typeId').notEmpty().withMessage('Pet Type is required')
];

// Helper to populate types for select dropdown
const getPetTypes = async () => PetType.findAll();

export const initCreationForm = async (req, res) => {
  const owner = await Owner.findByPk(req.params.ownerId);
  const types = await getPetTypes();
  res.render('pets/createOrUpdatePetForm', { 
    owner, 
    pet: {}, 
    types, 
    errors: null 
  });
};

export const processCreationForm = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const owner = await Owner.findByPk(req.params.ownerId);
    const types = await getPetTypes();
    return res.render('pets/createOrUpdatePetForm', { 
      owner, 
      pet: req.body, 
      types, 
      errors: errors.array() 
    });
  }

  await Pet.create({
    ...req.body,
    ownerId: req.params.ownerId
  });

  req.flash('message', 'New Pet has been Added');
  res.redirect(`/owners/${req.params.ownerId}`);
};

export const initUpdateForm = async (req, res) => {
  const pet = await Pet.findByPk(req.params.petId);
  const owner = await Owner.findByPk(req.params.ownerId);
  const types = await getPetTypes();
  
  res.render('pets/createOrUpdatePetForm', { 
    owner, 
    pet, 
    types, 
    errors: null 
  });
};

export const processUpdateForm = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const owner = await Owner.findByPk(req.params.ownerId);
    const types = await getPetTypes();
    // Reconstruct pet object for view
    const pet = { ...req.body, id: req.params.petId };
    return res.render('pets/createOrUpdatePetForm', { 
      owner, 
      pet, 
      types, 
      errors: errors.array() 
    });
  }

  await Pet.update(req.body, { where: { id: req.params.petId } });
  req.flash('message', 'Pet details updated');
  res.redirect(`/owners/${req.params.ownerId}`);
};
