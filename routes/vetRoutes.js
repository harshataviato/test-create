/**
 * Vet Controller
 * Handles listing Veterinarians.
 */
const express = require('express');
const router = express.Router();
const db = require('../models');

// GET /vets.html (HTML view)
router.get('.html', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const offset = (page - 1) * limit;

  const { count, rows } = await db.Vet.findAndCountAll({
    limit,
    offset,
    include: [{ model: db.Specialty, as: 'specialties' }]
  });

  res.render('vets/vetList', {
    listVets: rows,
    currentPage: page,
    totalPages: Math.ceil(count / limit),
    totalItems: count
  });
});

// GET /vets (JSON Resource)
router.get('/', async (req, res) => {
  const vets = await db.Vet.findAll({
    include: [{ model: db.Specialty, as: 'specialties' }]
  });
  res.json({ vetList: vets });
});

module.exports = router;
