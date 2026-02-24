import { Owner, Pet, PetType, Visit } from '../models/index.js';
import { Op } from 'sequelize';
import { body, validationResult } from 'express-validator';

/**
 * Form Validator Middleware for Owners
 */
export const validateOwner = [
  body('firstName').notEmpty().withMessage('First Name is required'),
  body('lastName').notEmpty().withMessage('Last Name is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('telephone').isNumeric().isLength({ min: 10, max: 10 }).withMessage('Telephone must be a 10-digit number')
];

export const initCreationForm = (req, res) => {
  res.render('owners/createOrUpdateOwnerForm', { owner: {}, errors: null });
};

export const processCreationForm = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('owners/createOrUpdateOwnerForm', { owner: req.body, errors: errors.array() });
  }
  try {
    const owner = await Owner.create(req.body);
    res.redirect(`/owners/${owner.id}`);
  } catch (err) {
    res.render('error', { message: 'Error creating owner', error: err });
  }
};

export const initFindForm = (req, res) => {
  res.render('owners/findOwners', { owner: {}, errors: null });
};

export const processFindForm = async (req, res) => {
  const { lastName } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const offset = (page - 1) * limit;

  try {
    const whereClause = lastName ? { lastName: { [Op.like]: `${lastName}%` } } : {};
    
    const { count, rows } = await Owner.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      include: [{ model: Pet, as: 'pets' }]
    });

    if (count === 0) {
      return res.render('owners/findOwners', { 
        owner: { lastName }, 
        errors: [{ msg: 'has not been found' }] // Matching standard error msg
      });
    }

    if (count === 1) {
      return res.redirect(`/owners/${rows[0].id}`);
    }

    res.render('owners/ownersList', {
      listOwners: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalItems: count
    });

  } catch (err) {
    res.render('error', { message: 'Error finding owners', error: err });
  }
};

export const showOwner = async (req, res) => {
  try {
    const owner = await Owner.findByPk(req.params.ownerId, {
      include: [{
        model: Pet,
        as: 'pets',
        include: [{ model: PetType, as: 'type' }, { model: Visit, as: 'visits' }]
      }]
    });

    if (!owner) throw new Error('Owner not found');

    res.render('owners/ownerDetails', { owner, message: req.flash('message') });
  } catch (err) {
    res.render('error', { message: 'Owner not found', error: err });
  }
};

export const initUpdateOwnerForm = async (req, res) => {
  const owner = await Owner.findByPk(req.params.ownerId);
  res.render('owners/createOrUpdateOwnerForm', { owner, errors: null });
};

export const processUpdateOwnerForm = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const owner = req.body;
    owner.id = req.params.ownerId; // Keep ID for form action
    return res.render('owners/createOrUpdateOwnerForm', { owner, errors: errors.array() });
  }

  await Owner.update(req.body, { where: { id: req.params.ownerId } });
  res.redirect(`/owners/${req.params.ownerId}`);
};
