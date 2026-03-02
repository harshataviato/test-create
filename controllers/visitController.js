const db = require('../models');

/**
 * Handles logic for adding Visits to Pets.
 */
class VisitController {
  
  async initNewVisitForm(req, res) {
    const owner = await db.Owner.findByPk(req.params.ownerId);
    const pet = await db.Pet.findByPk(req.params.petId, { include: ['type', 'visits'] });
    res.render('pets/createOrUpdateVisitForm', { owner, pet, visit: {} });
  }

  async processNewVisitForm(req, res) {
    try {
      await db.Visit.create({
        description: req.body.description,
        visitDate: req.body.visitDate,
        pet_id: req.params.petId
      });
      res.redirect(`/owners/${req.params.ownerId}`);
    } catch (err) {
      const owner = await db.Owner.findByPk(req.params.ownerId);
      const pet = await db.Pet.findByPk(req.params.petId, { include: ['type', 'visits'] });
      res.render('pets/createOrUpdateVisitForm', { owner, pet, visit: req.body, error: 'Validation failed' });
    }
  }
}

module.exports = new VisitController();
