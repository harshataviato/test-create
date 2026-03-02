const db = require('../models');

/**
 * Handles logic for Pet management.
 */
class PetController {

  async populateTypes() {
    return await db.PetType.findAll({ order: [['name', 'ASC']] });
  }

  async initCreationForm(req, res) {
    const owner = await db.Owner.findByPk(req.params.ownerId);
    const types = await this.populateTypes();
    res.render('pets/createOrUpdatePetForm', { owner, pet: {}, types, isNew: true });
  }

  async processCreationForm(req, res) {
    try {
      const { name, birthDate, typeId } = req.body;
      // Original logic: ensure pet name isn't duplicated for the same owner
      const existing = await db.Pet.findOne({ where: { name, owner_id: req.params.ownerId } });
      if (existing) throw new Error('Pet name already exists for this owner');

      await db.Pet.create({ 
        name, 
        birthDate, 
        type_id: typeId, 
        owner_id: req.params.ownerId 
      });
      res.redirect(`/owners/${req.params.ownerId}`);
    } catch (err) {
      const owner = await db.Owner.findByPk(req.params.ownerId);
      const types = await this.populateTypes();
      res.render('pets/createOrUpdatePetForm', { owner, pet: req.body, types, isNew: true, error: err.message });
    }
  }

  async initUpdateForm(req, res) {
    const owner = await db.Owner.findByPk(req.params.ownerId);
    const pet = await db.Pet.findByPk(req.params.petId);
    const types = await this.populateTypes();
    res.render('pets/createOrUpdatePetForm', { owner, pet, types, isNew: false });
  }

  async processUpdateForm(req, res) {
    await db.Pet.update({
      name: req.body.name,
      birthDate: req.body.birthDate,
      type_id: req.body.typeId
    }, { where: { id: req.params.petId } });
    res.redirect(`/owners/${req.params.ownerId}`);
  }
}

module.exports = new PetController();
