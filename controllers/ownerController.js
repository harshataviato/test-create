const db = require('../models');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');

/**
 * Shows the form to search for owners.
 */
exports.initFindForm = (req, res) => {
  res.render('owners/findOwners', { owner: {} });
};

/**
 * Processes the search form.
 * Handles exact matches, multiple matches (list), and no matches.
 */
exports.processFindForm = async (req, res) => {
  let { lastName } = req.query;
  // If no param provided, default to empty string (find all)
  lastName = lastName || '';

  try {
    const owners = await db.Owner.findAll({
      where: {
        lastName: { [Op.like]: `${lastName}%` }
      },
      include: [db.Pet]
    });

    if (owners.length === 0) {
      // No owners found
      res.render('owners/findOwners', { 
        owner: { lastName }, 
        errors: [{ msg: 'has not been found' }] 
      });
    } else if (owners.length === 1) {
      // 1 owner found
      res.redirect(`/owners/${owners[0].id}`);
    } else {
      // Multiple owners found
      res.render('owners/ownersList', { listOwners: owners });
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
};

/**
 * Shows the form to create a new owner.
 */
exports.initCreationForm = (req, res) => {
  res.render('owners/createOrUpdateOwnerForm', { owner: {} });
};

/**
 * Handles creation of a new owner.
 */
exports.processCreationForm = [
  // Validations
  body('firstName').notEmpty().withMessage('must not be empty'),
  body('lastName').notEmpty().withMessage('must not be empty'),
  body('address').notEmpty().withMessage('must not be empty'),
  body('city').notEmpty().withMessage('must not be empty'),
  body('telephone').matches(/\d{10}/).withMessage('Telephone must be a 10-digit number'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('owners/createOrUpdateOwnerForm', { 
        owner: req.body, 
        errors: errors.array() 
      });
    }

    try {
      const owner = await db.Owner.create(req.body);
      res.redirect(`/owners/${owner.id}`);
    } catch (err) {
      res.status(500).send(err.message);
    }
  }
];

/**
 * Displays owner details (including pets and visits).
 */
exports.showOwner = async (req, res) => {
  try {
    const owner = await db.Owner.findByPk(req.params.ownerId, {
      include: [{
        model: db.Pet,
        as: 'pets',
        include: [
          { model: db.PetType, as: 'type' },
          { model: db.Visit, as: 'visits' }
        ]
      }]
    });

    if (!owner) return res.status(404).send('Owner not found');

    res.render('owners/ownerDetails', { owner });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

/**
 * Shows form to update an owner.
 */
exports.initUpdateOwnerForm = async (req, res) => {
  try {
    const owner = await db.Owner.findByPk(req.params.ownerId);
    if (!owner) return res.status(404).send('Owner not found');
    res.render('owners/createOrUpdateOwnerForm', { owner });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

/**
 * Processes owner update.
 */
exports.processUpdateOwnerForm = [
  body('firstName').notEmpty().withMessage('must not be empty'),
  body('lastName').notEmpty().withMessage('must not be empty'),
  body('address').notEmpty().withMessage('must not be empty'),
  body('city').notEmpty().withMessage('must not be empty'),
  body('telephone').matches(/\d{10}/).withMessage('Telephone must be a 10-digit number'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const owner = req.body;
      owner.id = req.params.ownerId; // Ensure ID persists for form action
      return res.render('owners/createOrUpdateOwnerForm', { 
        owner, 
        errors: errors.array() 
      });
    }

    try {
      await db.Owner.update(req.body, { where: { id: req.params.ownerId } });
      res.redirect(`/owners/${req.params.ownerId}`);
    } catch (err) {
      res.status(500).send(err.message);
    }
  }
];
