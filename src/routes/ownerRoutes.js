const express = require('express');
const router = express.Router();
const { Owner, Pet, PetType, Visit } = require('../models');
const { Op } = require('sequelize');

/**
 * Pet Owner Management
 * Search, Paginate, and View details.
 */
router.get('/owners', async (req, res) => {
  const lastName = req.query.lastName || '';
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const offset = (page - 1) * limit;

  const { count, rows: owners } = await Owner.findAndCountAll({
    where: {
      lastName: { [Op.like]: `%${lastName}%` }
    },
    limit,
    offset
  });

  res.render('owners/list', { 
    owners, 
    lastName, 
    currentPage: page, 
    totalPages: Math.ceil(count / limit) 
  });
});

router.get('/owners/new', (req, res) => res.render('owners/form', { owner: {} }));

router.post('/owners/new', async (req, res) => {
  try {
    const owner = await Owner.create(req.body);
    res.redirect(`/owners/${owner.id}`);
  } catch (err) {
    res.render('owners/form', { owner: req.body, error: err });
  }
});

router.get('/owners/:id', async (req, res) => {
  const owner = await Owner.findByPk(req.params.id, {
    include: [{ model: Pet, include: [PetType, Visit] }]
  });
  res.render('owners/details', { owner });
});

/**
 * Pet Lifecycle Management & Clinical Visit Documentation
 */
router.get('/owners/:ownerId/pets/new', async (req, res) => {
  const types = await PetType.findAll();
  res.render('pets/form', { ownerId: req.params.ownerId, types, pet: {} });
});

router.post('/owners/:ownerId/pets/new', async (req, res) => {
  // Logic to ensure pet record integrity
  await Pet.create({ ...req.body, OwnerId: req.params.ownerId });
  res.redirect(`/owners/${req.params.ownerId}`);
});

router.post('/owners/:ownerId/pets/:petId/visits', async (req, res) => {
  await Visit.create({
    visitDate: req.body.visitDate,
    description: req.body.description,
    PetId: req.params.petId
  });
  res.redirect(`/owners/${req.params.ownerId}`);
});

module.exports = router;
