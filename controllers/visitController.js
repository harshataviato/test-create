/**
 * Visit Controller
 * Handles adding visits to pets.
 */
const db = require('../models');

module.exports = {
  // GET /owners/:ownerId/pets/:petId/visits/new
  initNewVisitForm: async (req, res) => {
    try {
      const pet = await db.Pet.findByPk(req.params.petId, {
        include: [
          { model: db.Owner, as: 'owner' },
          { model: db.PetType, as: 'type' },
          { model: db.Visit, as: 'visits' }
        ]
      });
      res.render('visits/form', { pet: pet.toJSON() });
    } catch (err) {
      res.render('error', { message: "Pet not found" });
    }
  },

  // POST /owners/:ownerId/pets/:petId/visits/new
  processNewVisitForm: async (req, res) => {
    try {
      await db.Visit.create({
        ...req.body,
        pet_id: req.params.petId
      });
      res.redirect(`/owners/${req.params.ownerId}`);
    } catch (error) {
      const pet = await db.Pet.findByPk(req.params.petId, {
        include: [{ model: db.Owner, as: 'owner' }]
      });
      res.render('visits/form', {
        pet: pet.toJSON(),
        errors: error.errors,
        visit: req.body
      });
    }
  }
};
