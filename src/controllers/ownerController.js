/**
 * Owner Controller
 * Handles CRUD operations for Owners.
 */
const { Owner, Pet, PetType, Visit } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

exports.initCreationForm = (req, res) => {
  res.render('owners/createOrUpdateOwnerForm', { owner: {}, errors: [] });
};

exports.processCreationForm = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('owners/createOrUpdateOwnerForm', { 
      owner: req.body, 
      errors: errors.array() 
    });
  }

  try {
    const owner = await Owner.create(req.body);
    res.redirect(`/owners/${owner.id}`);
  } catch (err) {
    res.render('owners/createOrUpdateOwnerForm', { 
      owner: req.body, 
      errors: [{ msg: err.message }] 
    });
  }
};

exports.initFindForm = (req, res) => {
  res.render('owners/findOwners', { owner: {}, errors: [] });
};

exports.processFindForm = async (req, res) => {
  let { lastName } = req.query;
  
  // Allow searching all if empty
  if (lastName === undefined) lastName = "";

  try {
    const owners = await Owner.findAll({
      where: {
        lastName: {
          [Op.like]: `${lastName}%` // Starts with logic
        }
      }
    });

    if (owners.length === 0) {
      return res.render('owners/findOwners', { 
        owner: { lastName }, 
        errors: [{ msg: 'has not been found' }] 
      });
    }

    if (owners.length === 1) {
      return res.redirect(`/owners/${owners[0].id}`);
    }

    // Pagination logic could go here, keeping simple for now
    res.render('owners/ownersList', { listOwners: owners });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error searching owners");
  }
};

exports.showOwner = async (req, res) => {
  const { ownerId } = req.params;
  try {
    const owner = await Owner.findByPk(ownerId, {
      include: [
        {
          model: Pet,
          as: 'pets',
          include: [
            { model: PetType, as: 'type' },
            { model: Visit, as: 'visits' }
          ]
        }
      ]
    });

    if (!owner) throw new Error("Owner not found");

    res.render('owners/ownerDetails', { owner });
  } catch (err) {
    res.status(404).send(err.message);
  }
};

exports.initUpdateOwnerForm = async (req, res) => {
  const { ownerId } = req.params;
  const owner = await Owner.findByPk(ownerId);
  res.render('owners/createOrUpdateOwnerForm', { owner, errors: [] });
};

exports.processUpdateOwnerForm = async (req, res) => {
  const { ownerId } = req.params;
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Merge ID back for the form URL
    const ownerData = { ...req.body, id: ownerId };
    return res.render('owners/createOrUpdateOwnerForm', { 
      owner: ownerData, 
      errors: errors.array() 
    });
  }

  await Owner.update(req.body, { where: { id: ownerId } });
  res.redirect(`/owners/${ownerId}`);
};
