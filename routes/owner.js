const express = require('express');
const router = express.Router();
const { Owner, Pet, PetType, Visit } = require('../models');
const { check, validationResult } = require('express-validator');
const { Op } = require('sequelize');

/**
 * GET /owners/find - Display find owners form
 */
router.get('/find', (req, res) => {
  res.render('owners/findOwners', { owner: {}, menu: 'owners' });
});

/**
 * GET /owners - Process search or list all
 */
router.get('/', async (req, res) => {
  const lastName = req.query.lastName || '';
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const offset = (page - 1) * limit;

  const { count, rows } = await Owner.findAndCountAll({
    where: {
      lastName: { [Op.like]: `${lastName}%` }
    },
    include: [{ model: Pet, as: 'pets' }],
    limit,
    offset,
    order: [['lastName', 'ASC']]
  });

  if (count === 0) {
    return res.render('owners/findOwners', { owner: { lastName }, error: 'notFound', menu: 'owners' });
  }

  if (count === 1 && !req.query.page) {
    return res.redirect(`/owners/${rows[0].id}`);
  }

  res.render('owners/ownersList', {
    listOwners: rows,
    currentPage: page,
    totalPages: Math.ceil(count / limit),
    totalItems: count,
    menu: 'owners'
  });
});

/**
 * GET /owners/new - Show create form
 */
router.get('/new', (req, res) => {
  res.render('owners/createOrUpdateOwnerForm', { owner: {}, menu: 'owners' });
});

/**
 * POST /owners/new - Create owner
 */
router.post('/new', [
  check('firstName').notEmpty(),
  check('lastName').notEmpty(),
  check('address').notEmpty(),
  check('city').notEmpty(),
  check('telephone').isLength({ min: 10, max: 10 }).isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('owners/createOrUpdateOwnerForm', { owner: req.body, errors: errors.array(), menu: 'owners' });
  }

  const owner = await Owner.create(req.body);
  res.redirect(`/owners/${owner.id}`);
});

/**
 * GET /owners/:id - Show details
 */
router.get('/:id', async (req, res) => {
  const owner = await Owner.findByPk(req.params.id, {
    include: [{ 
      model: Pet, 
      as: 'pets',
      include: ['type', { model: Visit, as: 'visits' }]
    }]
  });
  if (!owner) return res.status(404).send('Owner not found');
  res.render('owners/ownerDetails', { owner, menu: 'owners' });
});

/**
 * GET /owners/:id/edit - Update form
 */
router.get('/:id/edit', async (req, res) => {
  const owner = await Owner.findByPk(req.params.id);
  res.render('owners/createOrUpdateOwnerForm', { owner, menu: 'owners' });
});

/**
 * POST /owners/:id/edit - Update owner
 */
router.post('/:id/edit', async (req, res) => {
  await Owner.update(req.body, { where: { id: req.params.id } });
  res.redirect(`/owners/${req.params.id}`);
});

/**
 * Senior Engineer Note: Sub-resource routing for Pets
 */
router.use('/:ownerId/pets', require('./pet'));

module.exports = router;
