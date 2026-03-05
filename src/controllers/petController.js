/**
 * Pet Controller
 * Handles Pet creation and updates linked to an Owner
 */
const { Owner, Pet, PetType } = require('../models');

exports.initCreationForm = async (req, res) => {
  const owner = await Owner.findByPk(req.params.ownerId);
  const types = await PetType.findAll();
  res.render('pets/createOrUpdatePetForm', { 
    owner, 
    pet: {}, 
    types, 
    isNew: true, 
    menu: 'owners' 
  });
};

exports.processCreationForm = async (req, res) => {
  const { name, birthDate, typeId } = req.body;
  await Pet.create({
    name,
    birthDate,
    type_id: typeId,
    owner_id: req.params.ownerId
  });
  res.redirect(`/owners/${req.params.ownerId}`);
};

exports.initUpdateForm = async (req, res) => {
  const owner = await Owner.findByPk(req.params.ownerId);
  const pet = await Pet.findByPk(req.params.petId, { include: ['type'] });
  const types = await PetType.findAll();
  res.render('pets/createOrUpdatePetForm', { 
    owner, 
    pet, 
    types, 
    isNew: false, 
    menu: 'owners' 
  });
};

exports.processUpdateForm = async (req, res) => {
  const { name, birthDate, typeId } = req.body;
  await Pet.update({
    name,
    birthDate,
    type_id: typeId
  }, { where: { id: req.params.petId } });
  res.redirect(`/owners/${req.params.ownerId}`);
};
