const express = require('express');
const router = express.Router();
const { Vet, Specialty } = require('../models');

/**
 * GET /vets - List all veterinarians with pagination
 */
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const offset = (page - 1) * limit;

  const { count, rows } = await Vet.findAndCountAll({
    include: [Specialty],
    limit,
    offset
  });

  res.render('vets/vetList', {
    listVets: rows,
    currentPage: page,
    totalPages: Math.ceil(count / limit),
    totalItems: count,
    menu: 'vets'
  });
});

module.exports = router;
