const { Owner, Pet, PetType, Visit } = require('../models');
const { Op } = require('sequelize');
const { body, validationResult } = require('express-validator');

exports.initFindForm = (req, res) => {
  res.render('owners/findOwners', { owner: {} });
};

exports.processFindForm = async (req, res, next) => {
  try {
    const { lastName } = req.query;
    
    // Allow broad search if empty
    const whereClause = lastName ? { lastName: { [Op.like]: `${lastName}%` } } : {};

    const owners = await Owner.findAll({ where: whereClause });

    if (owners.length === 0) {
      // No owners found
      return res.render('owners/findOwners', { 
        owner: { lastName },
        errors: { lastName: { msg: 'has not been found' } } 
      });
    } else if (owners.length === 1) {
      // 1 owner found
      return res.redirect(`/owners/${owners[0].id}`);
    } else {
      // Multiple owners found - Pagination logic could go here, simplified for list view
      return res.render('owners/ownersList', { listOwners: owners });
    }
  } catch (err) {
    next(err);
  }
};

exports.initCreationForm = (req, res) => {
  res.render('owners/createOrUpdateOwnerForm', { owner: {}, errors: null });
};

exports.processCreationForm = [
  // Validation Rules
  body('firstName').notEmpty().withMessage('must not be empty'),
  body('lastName').notEmpty().withMessage('must not be empty'),
  body('address').notEmpty().withMessage('must not be empty'),
  body('city').notEmpty().withMessage('must not be empty'),
  body('telephone').matches(/\d{10}/).withMessage('telephone must be 10 digits'),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('owners/createOrUpdateOwnerForm', { 
        owner: req.body, 
        errors: errors.mapped() 
      });
    }

    try {
      const owner = await Owner.create(req.body);
      res.redirect(`/owners/${owner.id}`);
    } catch (err) {
      next(err);
    }
  }
];

exports.showOwner = async (req, res, next) => {
  try {
    const owner = await Owner.findByPk(req.params.ownerId, {
      include: [{
        model: Pet,
        as: 'pets',
        include: [{ model: PetType, as: 'type' }, { model: Visit, as: 'visits' }]
      }],
      order: [[{ model: Pet, as: 'pets' }, 'name', 'ASC']]
    });

    if (!owner) return res.status(404).send("Owner not found");

    res.render('owners/ownerDetails', { owner });
  } catch (err) {
    next(err);
  }
};

exports.initUpdateOwnerForm = async (req, res, next) => {
  try {
    const owner = await Owner.findByPk(req.params.ownerId);
    if (!owner) return res.status(404).send("Owner not found");
    res.render('owners/createOrUpdateOwnerForm', { owner, errors: null });
  } catch (err) {
    next(err);
  }
};

exports.processUpdateOwnerForm = [
  // Same validation as creation
  body('firstName').notEmpty().withMessage('must not be empty'),
  body('lastName').notEmpty().withMessage('must not be empty'),
  body('address').notEmpty().withMessage('must not be empty'),
  body('city').notEmpty().withMessage('must not be empty'),
  body('telephone').matches(/\d{10}/).withMessage('telephone must be 10 digits'),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Re-merge id into body so the form action URL remains correct
      req.body.id = req.params.ownerId;
      return res.render('owners/createOrUpdateOwnerForm', { 
        owner: req.body, 
        errors: errors.mapped() 
      });
    }

    try {
      await Owner.update(req.body, { where: { id: req.params.ownerId } });
      res.redirect(`/owners/${req.params.ownerId}`);
    } catch (err) {
      next(err);
    }
  }
];
