const { Owner, Pet, Visit } = require('../models');
const { body, validationResult } = require('express-validator');

exports.initNewVisitForm = async (req, res, next) => {
  try {
    const pet = await Pet.findByPk(req.params.petId, {
      include: [
        { model: Owner }, // Needed for breadcrumbs context
        { model: Visit, as: 'visits' }
      ]
    });
    
    if (!pet) return res.status(404).send("Pet not found");

    res.render('pets/createOrUpdateVisitForm', {
      pet,
      visit: {},
      errors: null
    });
  } catch (err) {
    next(err);
  }
};

exports.processNewVisitForm = [
  body('date').isDate().withMessage('invalid date'),
  body('description').notEmpty().withMessage('is required'),

  async (req, res, next) => {
    try {
      const { ownerId, petId } = req.params;
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        const pet = await Pet.findByPk(petId, {
          include: [{ model: Owner }, { model: Visit, as: 'visits' }]
        });
        
        return res.render('pets/createOrUpdateVisitForm', {
          pet,
          visit: req.body,
          errors: errors.mapped()
        });
      }

      await Visit.create({ ...req.body, petId });
      res.redirect(`/owners/${ownerId}`);
    } catch (err) {
      next(err);
    }
  }
];
