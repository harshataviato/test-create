const { Pet, Visit } = require('../models');
const { validationResult } = require('express-validator');

module.exports = {
  // GET /owners/:ownerId/pets/:petId/visits/new
  initNewVisitForm: async (req, res, next) => {
    try {
      const pet = await Pet.findByPk(req.params.petId, { include: 'visits' });
      res.render('pets/createOrUpdateVisitForm', { 
        pet: pet.toJSON(),
        visit: { new: true } 
      });
    } catch (err) { next(err); }
  },

  // POST /owners/:ownerId/pets/:petId/visits/new
  processNewVisitForm: async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const pet = await Pet.findByPk(req.params.petId, { include: 'visits' });
      return res.render('pets/createOrUpdateVisitForm', {
        pet: pet.toJSON(),
        visit: req.body,
        errors: errors.mapped()
      });
    }

    try {
      await Visit.create({
        visitDate: req.body.date,
        description: req.body.description,
        petId: req.params.petId
      });
      res.redirect(`/owners/${req.params.ownerId}`);
    } catch (err) { next(err); }
  }
};
