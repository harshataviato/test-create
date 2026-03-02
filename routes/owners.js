/**
 * Owner and Pet Controller/Router
 * Logic for creating, finding, and updating owners and their pets
 */
const express = require('express');
const router = express.Router();
const { Owner, Pet, PetType, Visit } = require('../models');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');

// GET /owners/find - Init Find Form
router.get('/find', (req, res) => {
  res.render('owners/findOwners', { menu: 'owners', owner: {} });
});

// GET /owners - Process Find Form (Search)
router.get('/', async (req, res) => {
  const lastName = req.query.lastName || '';
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const offset = (page - 1) * limit;

  const { count, rows } = await Owner.findAndCountAll({
    where: { lastName: { [Op.like]: `${lastName}%` } },
    include: [{ model: Pet, as: 'pets', include: ['type'] }],
    limit,
    offset,
    order: [['lastName', 'ASC']]
  });

  if (count === 0) {
    return res.render('owners/findOwners', { 
      menu: 'owners', 
      owner: { lastName },
      errors: [{ msg: 'has not been found', path: 'lastName' }]
    });
  }

  if (count === 1 && !req.query.page) {
    return res.redirect(`/owners/${rows[0].id}`);
  }

  res.render('owners/ownersList', {
    menu: 'owners',
    listOwners: rows,
    currentPage: page,
    totalPages: Math.ceil(count / limit),
    totalItems: count
  });
});

// GET /owners/new - Init Creation Form
router.get('/new', (req, res) => {
  res.render('owners/createOrUpdateOwnerForm', { menu: 'owners', owner: { isNew: true } });
});

// POST /owners/new - Process Creation Form
router.post('/new', [
  body('firstName').notEmpty(),
  body('lastName').notEmpty(),
  body('address').notEmpty(),
  body('city').notEmpty(),
  body('telephone').isNumeric().isLength({ min: 10, max: 10 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('owners/createOrUpdateOwnerForm', { 
      menu: 'owners', 
      owner: { ...req.body, isNew: true },
      errors: errors.array()
    });
  }
  const owner = await Owner.create(req.body);
  res.redirect(`/owners/${owner.id}`);
});

// GET /owners/:ownerId - Show Owner Details
router.get('/:ownerId', async (req, res) => {
  const owner = await Owner.findByPk(req.params.ownerId, {
    include: [{ 
      model: Pet, as: 'pets', 
      include: ['type', { model: Visit, as: 'visits' }] 
    }]
  });
  res.render('owners/ownerDetails', { menu: 'owners', owner });
});

// PET MANAGEMENT
// GET /owners/:ownerId/pets/new - Init Pet Creation
router.get('/:ownerId/pets/new', async (req, res) => {
  const owner = await Owner.findByPk(req.params.ownerId);
  const types = await PetType.findAll();
  res.render('pets/createOrUpdatePetForm', { 
    menu: 'owners', owner, types, pet: { isNew: true } 
  });
});

// POST /owners/:ownerId/pets/new - Process Pet Creation
router.post('/:ownerId/pets/new', async (req, res) => {
  const { name, birthDate, typeId } = req.body;
  await Pet.create({ name, birthDate, typeId, ownerId: req.params.ownerId });
  res.redirect(`/owners/${req.params.ownerId}`);
});

module.exports = router;
