/**
 * Pet and Visit Controller.
 * 
 * Handles adding pets to owners and adding visits to pets.
 */

const { Owner, Pet, Visit } = require('../models');
const { validationResult } = require('express-validator');

// --- Pet Operations ---

exports.newPetForm = async (req, res, next) => {
  try {
    const owner = await Owner.findByPk(req.params.ownerId);
    // Pre-populate Types (usually from DB, hardcoded for simplicity here)
    const types = ['Cat', 'Dog', 'Lizard', 'Snake', 'Bird', 'Hamster'];
    res.render('pets/createOrUpdate', { owner, pet: {}, types, mode: 'create' });
  } catch (err) { next(err); }
};

exports.processNewPet = async (req, res, next) => {
  const errors = validationResult(req);
  const ownerId = req.params.ownerId;
  
  if (!errors.isEmpty()) {
    const owner = await Owner.findByPk(ownerId);
    const types = ['Cat', 'Dog', 'Lizard', 'Snake', 'Bird', 'Hamster'];
    return res.render('pets/createOrUpdate', { owner, pet: req.body, types, errors: errors.array(), mode: 'create' });
  }

  try {
    await Pet.create({ ...req.body, OwnerId: ownerId });
    res.redirect(`/owners/${ownerId}`);
  } catch (err) { next(err); }
};

// --- Visit Operations ---

exports.newVisitForm = async (req, res, next) => {
  try {
    const pet = await Pet.findByPk(req.params.petId, { include: Owner });
    res.render('visits/create', { pet, visit: {} });
  } catch (err) { next(err); }
};

exports.processNewVisit = async (req, res, next) => {
  const errors = validationResult(req);
  const petId = req.params.petId;

  if (!errors.isEmpty()) {
    const pet = await Pet.findByPk(petId, { include: Owner });
    return res.render('visits/create', { pet, visit: req.body, errors: errors.array() });
  }

  try {
    await Visit.create({ ...req.body, PetId: petId });
    // Navigate back to owner details
    const pet = await Pet.findByPk(petId);
    res.redirect(`/owners/${pet.OwnerId}`);
  } catch (err) { next(err); }
};
