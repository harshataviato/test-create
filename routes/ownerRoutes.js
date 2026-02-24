/**
 * Owner Controller
 * Handles Owner CRUD operations.
 */
const express = require('express');
const router = express.Router();
const db = require('../models');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');

// Validation rules for Owner
const ownerValidationRules = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('telephone').matches(/^\d{10}$/).withMessage('Telephone must be a 10-digit number')
];

// GET /owners/new - Init creation form
router.get('/new', (req, res) => {
  res.render('owners/createOrUpdateOwnerForm', { owner: {}, errors: null });
});

// POST /owners/new - Process creation
router.post('/new', ownerValidationRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('owners/createOrUpdateOwnerForm', { 
      owner: req.body, 
      errors: errors.mapped() 
    });
  }

  try {
    const owner = await db.Owner.create(req.body);
    res.redirect(`/owners/${owner.id}`);
  } catch (err) {
    res.status(500).send("Error creating owner");
  }
});

// GET /owners/find - Init find form
router.get('/find', (req, res) => {
  res.render('owners/findOwners', { owner: {}, errors: null });
});

// GET /owners - Process find form (search by lastname)
router.get('/', async (req, res) => {
  const { lastName } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const offset = (page - 1) * limit;

  // Broadest search if empty
  const condition = lastName ? { lastName: { [Op.like]: `${lastName}%` } } : {};

  try {
    const { count, rows } = await db.Owner.findAndCountAll({
      where: condition,
      limit,
      offset,
      include: [{ model: db.Pet, as: 'pets' }] // Eager load pets for display
    });

    if (count === 0) {
      return res.render('owners/findOwners', { 
        owner: { lastName }, 
        errors: { lastName: { msg: 'has not been found' } } 
      });
    }

    if (count === 1) {
      return res.redirect(`/owners/${rows[0].id}`);
    }

    res.render('owners/ownersList', {
      listOwners: rows,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count
    });

  } catch (err) {
    res.status(500).send("Error finding owners");
  }
});

// GET /owners/:id - Show owner details
router.get('/:id', async (req, res) => {
  try {
    const owner = await db.Owner.findByPk(req.params.id, {
      include: [
        {
          model: db.Pet,
          as: 'pets',
          include: [{ model: db.PetType, as: 'type' }, { model: db.Visit, as: 'visits' }]
        }
      ]
    });

    if (!owner) return res.status(404).send("Owner not found");
    res.render('owners/ownerDetails', { owner });
  } catch (err) {
    res.status(500).send("Error retrieving owner");
  }
});

// GET /owners/:id/edit - Init update form
router.get('/:id/edit', async (req, res) => {
  const owner = await db.Owner.findByPk(req.params.id);
  res.render('owners/createOrUpdateOwnerForm', { owner, errors: null });
});

// POST /owners/:id/edit - Process update
router.post('/:id/edit', ownerValidationRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const owner = req.body;
    owner.id = req.params.id; // Ensure ID persists
    return res.render('owners/createOrUpdateOwnerForm', { owner, errors: errors.mapped() });
  }

  await db.Owner.update(req.body, { where: { id: req.params.id } });
  res.redirect(`/owners/${req.params.id}`);
});

module.exports = router;
