const express = require('express');
const router = express.Router();
const { Vet, Specialty } = require('../db/models');

/**
 * Controller for Veterinarian views
 */
router.get('/', async (req, res) => {
    const vets = await Vet.findAll({
        include: [Specialty]
    });
    res.render('vets/vetList', { listVets: vets, menu: 'vets' });
});

module.exports = router;
