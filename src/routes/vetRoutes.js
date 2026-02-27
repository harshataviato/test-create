const express = require('express');
const router = express.Router();
const { Vet, Specialty } = require('../models');
const cacheService = require('../services/cacheService');

/**
 * Veterinarian Specialist Directory
 * Uses caching to optimize performance for frequently accessed vet lists.
 */
router.get('/vets', async (req, res) => {
  const cacheKey = 'vets_list';
  let vets = cacheService.get(cacheKey);

  if (!vets) {
    vets = await Vet.findAll({ include: Specialty });
    cacheService.set(cacheKey, vets);
  }

  // Support both HTML and JSON (REST API)
  res.format({
    html: () => res.render('vets/index', { vets }),
    json: () => res.json(vets)
  });
});

module.exports = router;
