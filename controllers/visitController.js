import { Pet, Visit, Owner } from '../models/index.js';
import { body, validationResult } from 'express-validator';

export const validateVisit = [
  body('date').isDate().withMessage('Date is required'),
  body('description').notEmpty().withMessage('Description is required')
];

export const initNewVisitForm = async (req, res) => {
  const pet = await Pet.findByPk(req.params.petId, {
    include: [{ model: Visit, as: 'visits' }, {model: Owner}] // Include owner to display name
  });
  
  res.render('pets/createOrUpdateVisitForm', { 
    pet, 
    visit: {}, 
    owner: pet.owner, // Pass owner explicitly for layout/breadcrumbs
    errors: null 
  });
};

export const processNewVisitForm = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const pet = await Pet.findByPk(req.params.petId, {
        include: [{ model: Visit, as: 'visits' }, {model: Owner}]
    });
    return res.render('pets/createOrUpdateVisitForm', { 
      pet, 
      visit: req.body, 
      owner: pet.owner,
      errors: errors.array() 
    });
  }

  await Visit.create({
    ...req.body,
    petId: req.params.petId
  });

  req.flash('message', 'Your visit has been booked');
  res.redirect(`/owners/${req.params.ownerId}`);
};
