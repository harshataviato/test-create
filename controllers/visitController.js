const db = require('../models');
const { body, validationResult } = require('express-validator');

/**
 * Shows form to add a new visit.
 */
exports.initNewVisitForm = async (req, res) => {
  try {
    const pet = await db.Pet.findByPk(req.params.petId, {
      include: [
        { model: db.PetType, as: 'type' },
        { model: db.Visit, as: 'visits' },
        { model: db.Owner, as: 'owner' }
      ]
    });

    if (!pet) return res.status(404).send('Pet not found');

    res.render('pets/createOrUpdateVisitForm', { 
      pet, 
      visit: {}, 
      owner: pet.owner 
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

/**
 * Processes creation of a new visit.
 */
exports.processNewVisitForm = [
  body('date').isDate().withMessage('invalid date'),
  body('description').notEmpty().withMessage('is required'),

  async (req, res) => {
    const errors = validationResult(req);
    
    // Fetch context again for re-rendering on error
    const pet = await db.Pet.findByPk(req.params.petId, {
        include: [{ model: db.Visit, as: 'visits' }, { model: db.Owner, as: 'owner' }]
    });

    if (!errors.isEmpty()) {
      return res.render('pets/createOrUpdateVisitForm', {
        pet,
        owner: pet.owner,
        visit: req.body,
        errors: errors.array()
      });
    }

    try {
      await db.Visit.create({
        ...req.body,
        petId: req.params.petId
      });
      res.redirect(`/owners/${req.params.ownerId}`);
    } catch (err) {
      res.status(500).send(err.message);
    }
  }
];
