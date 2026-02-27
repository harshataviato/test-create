const { Owner, Pet, PetType } = require('../models');

class PetController {

  static async initCreationForm(req, res) {
    const owner = await Owner.findByPk(req.params.ownerId);
    const types = await PetType.findAll();
    res.render('pets/createOrUpdatePetForm', { owner, pet: {}, types, isNew: true });
  }

  static async processCreationForm(req, res) {
    try {
      const { name, birthDate, typeId } = req.body;
      await Pet.create({ name, birthDate, typeId, ownerId: req.params.ownerId });
      res.redirect(`/owners/${req.params.ownerId}`);
    } catch (err) {
      const owner = await Owner.findByPk(req.params.ownerId);
      const types = await PetType.findAll();
      res.render('pets/createOrUpdatePetForm', { 
        owner, pet: req.body, types, isNew: true, errors: err.errors 
      });
    }
  }

  static async initUpdateForm(req, res) {
    const owner = await Owner.findByPk(req.params.ownerId);
    const pet = await Pet.findByPk(req.params.petId);
    const types = await PetType.findAll();
    res.render('pets/createOrUpdatePetForm', { owner, pet, types, isNew: false });
  }

  static async processUpdateForm(req, res) {
    const { name, birthDate, typeId } = req.body;
    await Pet.update({ name, birthDate, typeId }, { where: { id: req.params.petId } });
    res.redirect(`/owners/${req.params.ownerId}`);
  }
}

module.exports = PetController;
