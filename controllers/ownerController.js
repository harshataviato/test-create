const express = require('express');
const router = express.Router();
const { Owner, Pet, PetType, Visit } = require('../models');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');

/**
 * Logic to find and display owners.
 */
router.get('/find', (req, res) => {
  res.render('owners/findOwners', { owner: {} });
});

router.get('/', async (req, res) => {
  let lastName = req.query.lastName || '';
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const offset = (page - 1) * limit;

  const { count, rows } = await Owner.findAndCountAll({
    where: { lastName: { [Op.like]: `${lastName}%` } },
    include: [{ model: Pet, as: 'pets' }],
    limit,
    offset,
    order: [['lastName', 'ASC']]
  });

  if (count === 0) {
    return res.render('owners/findOwners', { owner: { lastName }, error: 'notFound' });
  } else if (count === 1 && !req.query.page) {
    return res.redirect(`/owners/${rows[0].id}`);
  }

  res.render('owners/ownersList', {
    listOwners: rows,
    currentPage: page,
    totalPages: Math.ceil(count / limit),
    totalItems: count,
    lastName
  });
});

router.get('/new', (req, res) => {
  res.render('owners/createOrUpdateOwnerForm', { owner: { isNew: true } });
});

router.post('/new', [
  body('firstName').notEmpty(),
  body('lastName').notEmpty(),
  body('address').notEmpty(),
  body('city').notEmpty(),
  body('telephone').isNumeric().isLength({ min: 10, max: 10 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('owners/createOrUpdateOwnerForm', { owner: req.body, isNew: true, errors: errors.array() });
  }
  const owner = await Owner.create(req.body);
  res.redirect(`/owners/${owner.id}`);
});

router.get('/:ownerId', async (req, res) => {
  const owner = await Owner.findByPk(req.params.ownerId, {
    include: [{ 
      model: Pet, as: 'pets', 
      include: [{ model: PetType, as: 'type' }, { model: Visit, as: 'visits' }] 
    }]
  });
  res.render('owners/ownerDetails', { owner });
});

router.get('/:ownerId/edit', async (req, res) => {
  const owner = await Owner.findByPk(req.params.ownerId);
  res.render('owners/createOrUpdateOwnerForm', { owner, isNew: false });
});

router.post('/:ownerId/edit', async (req, res) => {
  await Owner.update(req.body, { where: { id: req.params.ownerId } });
  res.redirect(`/owners/${req.params.ownerId}`);
});

module.exports = router;
