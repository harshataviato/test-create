/**
 * Veterinarian Controller
 * Handles vet listings with pagination
 */
const express = require('express');
const router = express.Router();
const { Vet, Specialty } = require('../models');

router.get('/vets.html', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const offset = (page - 1) * limit;

  const { count, rows } = await Vet.findAndCountAll({
    include: [Specialty],
    limit,
    offset,
    order: [['lastName', 'ASC']]
  });

  res.render('vets/vetList', {
    menu: 'vets',
    listVets: rows,
    currentPage: page,
    totalPages: Math.ceil(count / limit),
    totalItems: count
  });
});

// JSON API Endpoint (Mirrors Spring's @ResponseBody)
router.get('/vets', async (req, res) => {
  const vets = await Vet.findAll({ include: [Specialty] });
  res.json({ vetList: vets });
});

module.exports = router;
