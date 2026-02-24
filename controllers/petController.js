/**
 * Pet Controller
 * Handles Pet creation and updates.
 */
const db = require('../models');

module.exports = {
  // GET /owners/:ownerId/pets/new
  initCreationForm: async (req, res) => {
    try {
      const owner = await db.Owner.findByPk(req.params.ownerId);
      const types = await db.PetType.findAll();
      res.render('pets/form', { 
        owner: owner.toJSON(), 
        types: types.map(t => t.toJSON()),
        pet: {}
      });
    } catch (err) {
      res.render('error', { message: "Owner not found" });
    }
  },

  // POST /owners/:ownerId/pets/new
  processCreationForm: async (req, res) => {
    const ownerId = req.params.ownerId;
    try {
      await db.Pet.create({ ...req.body, owner_id: ownerId });
      res.redirect(`/owners/${ownerId}`);
    } catch (error) {
      const owner = await db.Owner.findByPk(ownerId);
      const types = await db.PetType.findAll();
      res.render('pets/form', {
        owner: owner.toJSON(),
        types: types.map(t => t.toJSON()),
        pet: req.body,
        errors: error.errors
      });
    }
  },

  // GET /owners/:ownerId/pets/:petId/edit
  initUpdateForm: async (req, res) => {
    try {
      const pet = await db.Pet.findByPk(req.params.petId, {
        include: [{ model: db.Owner, as: 'owner' }]
      });
      const types = await db.PetType.findAll();
      
      res.render('pets/form', {
        pet: pet.toJSON(),
        owner: pet.owner.toJSON(),
        types: types.map(t => t.toJSON())
      });
    } catch (err) {
      res.render('error', { message: "Pet not found" });
    }
  },

  // POST /owners/:ownerId/pets/:petId/edit
  processUpdateForm: async (req, res) => {
    try {
      await db.Pet.update(req.body, { where: { id: req.params.petId } });
      res.redirect(`/owners/${req.params.ownerId}`);
    } catch (error) {
      const types = await db.PetType.findAll();
      const owner = await db.Owner.findByPk(req.params.ownerId);
      const pet = req.body;
      pet.id = req.params.petId; // maintain ID for form action
      
      res.render('pets/form', {
        pet: pet,
        owner: owner.toJSON(),
        types: types.map(t => t.toJSON()),
        errors: error.errors
      });
    }
  }
};
