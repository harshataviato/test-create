/**
 * Visit Controller
 * Handles booking visits.
 */
const { Owner, Pet, Visit } = require('../models');
const { validationResult } = require('express-validator');

exports.initNewVisitForm = async (req, res) => {
  const { ownerId, petId } = req.params;
  const pet = await Pet.findByPk(petId, { include: { model: Visit, as: 'visits' }});
  const owner = await Owner.findByPk(ownerId);

  res.render('pets/createOrUpdateVisitForm', {
    visit: {},
    pet,
    owner,
    errors: []
  });
};

exports.processNewVisitForm = async (req, res) => {
  const { ownerId, petId } = req.params;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const pet = await Pet.findByPk(petId, { include: { model: Visit, as: 'visits' }});
    const owner = await Owner.findByPk(ownerId);
    
    return res.render('pets/createOrUpdateVisitForm', {
      visit: req.body,
      pet,
      owner,
      errors: errors.array()
    });
  }

  // Java entity maps "date" from form to "visitDate" in DB or uses "date" property.
  // We mapped it to visitDate in Model, form sends "date".
  await Visit.create({
    visitDate: req.body.date,
    description: req.body.description,
    petId: petId
  });

  res.redirect(`/owners/${ownerId}`);
};
