/**
 * Visit Controller
 * 
 * Handles creation of new visits for a pet.
 */
const { Pet, Visit } = require('../models');
const { body, validationResult } = require('express-validator');

// Middleware to load Pet and its Visits
exports.loadPetWithVisits = async (req, res, next) => {
  try {
    const pet = await Pet.findByPk(req.params.petId, {
      include: [{ model: Visit, as: 'visits' }]
    });
    if (!pet) return res.status(404).render('error', { message: 'Pet not found' });
    req.pet = pet;
    res.locals.pet = pet;
    next();
  } catch (err) {
    next(err);
  }
};

exports.initNewVisitForm = (req, res) => {
  res.render('pets/createOrUpdateVisitForm', { visit: { new: true }, errors: null });
};

exports.processNewVisitForm = [
  body('date').isDate().withMessage('Invalid Date'),
  body('description').notEmpty().withMessage('Description is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('pets/createOrUpdateVisitForm', { 
        visit: { ...req.body, new: true }, 
        errors: errors.array() 
      });
    }

    try {
      await Visit.create({
        date: req.body.date,
        description: req.body.description,
        pet_id: req.pet.id
      });
      res.redirect(`/owners/${req.params.ownerId}`);
    } catch (err) {
      console.error(err);
      res.render('error', { message: 'Could not save visit' });
    }
  }
];
