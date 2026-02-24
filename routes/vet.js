/**
 * Route handlers for Veterinarians.
 * Supports HTML view and JSON response.
 */
const express = require('express');
const router = express.Router();
const { Vet, Specialty } = require('../models');

// HTML: List all vets with pagination
router.get('.html', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const offset = (page - 1) * limit;

        const { count, rows } = await Vet.findAndCountAll({
            include: [Specialty],
            limit: limit,
            offset: offset,
            order: [['lastName', 'ASC']]
        });

        res.render('vets/vetList', {
            menu: 'vets',
            listVets: rows,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            totalItems: count
        });
    } catch (err) {
        next(err);
    }
});

// JSON: List all vets (full list)
router.get('/', async (req, res, next) => {
    try {
        const vets = await Vet.findAll({
            include: [Specialty]
        });
        res.json({ vetList: vets });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
