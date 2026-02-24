/**
 * Owner Controller
 * 
 * Handles all logic related to Owner management:
 * - Find owners
 * - Create/Update owners
 * - View owner details
 */
const { Owner, Pet, PetType, Visit } = require('../models');
const { Op } = require('sequelize');
const { body, validationResult } = require('express-validator');

// Validation rules for Owner
const ownerValidationRules = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('telephone').matches(/^\d{10}$/).withMessage('Telephone must be a 10-digit number')
];

// Display the find form
exports.initFindForm = (req, res) => {
  res.render('owners/findOwners', { owner: {} });
};

// Process the find form
exports.processFindForm = async (req, res) => {
  let { lastName } = req.query;
  lastName = lastName || '';

  // Pagination logic
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const offset = (page - 1) * limit;

  try {
    const { count, rows } = await Owner.findAndCountAll({
      where: {
        lastName: { [Op.like]: `${lastName}%` }
      },
      limit,
      offset,
      include: [{ model: Pet, as: 'pets' }] // Include pets for displaying names if needed
    });

    if (count === 0) {
      // No owners found
      return res.render('owners/findOwners', { 
        owner: { lastName }, 
        errors: [{ msg: 'has not been found' }] 
      });
    }

    if (count === 1) {
      // One owner found, redirect to details
      return res.redirect(`/owners/${rows[0].id}`);
    }

    // Multiple owners found, render list
    const totalPages = Math.ceil(count / limit);
    res.render('owners/ownersList', { 
      listOwners: rows, 
      currentPage: page, 
      totalPages: totalPages, 
      totalItems: count 
    });

  } catch (err) {
    console.error(err);
    res.render('error', { message: 'Error finding owners' });
  }
};

// Display creation form
exports.initCreationForm = (req, res) => {
  res.render('owners/createOrUpdateOwnerForm', { owner: {}, errors: null });
};

// Process creation
exports.processCreationForm = [
  ownerValidationRules,
  async (req, res) => {
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
      console.error(err);
      res.render('error', { message: 'Error creating owner' });
    }
  }
];

// Display edit form
exports.initUpdateOwnerForm = async (req, res) => {
  const { ownerId } = req.params;
  const owner = await Owner.findByPk(ownerId);
  if (!owner) return res.status(404).render('error', { message: 'Owner not found' });
  res.render('owners/createOrUpdateOwnerForm', { owner, errors: null });
};

// Process update
exports.processUpdateOwnerForm = [
  ownerValidationRules,
  async (req, res) => {
    const { ownerId } = req.params;
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      const owner = req.body;
      owner.id = ownerId;
      return res.render('owners/createOrUpdateOwnerForm', { 
        owner, 
        errors: errors.array() 
      });
    }

    try {
      await Owner.update(req.body, { where: { id: ownerId } });
      res.redirect(`/owners/${ownerId}`);
    } catch (err) {
      console.error(err);
      res.render('error', { message: 'Error updating owner' });
    }
  }
];

// Show details
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
      ],
      order: [[{ model: Pet, as: 'pets' }, 'name', 'ASC']]
    });

    if (!owner) return res.status(404).render('error', { message: 'Owner not found' });

    res.render('owners/ownerDetails', { owner });
  } catch (err) {
    console.error(err);
    res.render('error', { message: 'Database error' });
  }
};
