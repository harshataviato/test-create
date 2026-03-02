const express = require('express');
const router = express.Router();
const { Vet, Specialty } = require('../models');

/**
 * VetController implementation.
 * Handles both HTML (pageable) and JSON responses.
 */

// Helper function to get vets
const getVets = async (page = 1, limit = 5) => {
    // If limit is null, fetch all
    const options = {
        include: [{ model: Specialty, as: 'specialties' }],
        order: [['lastName', 'ASC']]
    };
    
    if (limit) {
        options.limit = limit;
        options.offset = (page - 1) * limit;
    }

    return await Vet.findAndCountAll(options);
};

// GET /vets.html (HTML View with Pagination)
router.get('.html', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    
    try {
        const { count, rows } = await getVets(page, limit);
        
        res.render('vets/vetList', {
            listVets: rows,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            totalItems: count
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching vets');
    }
});

// GET /vets (JSON Resource)
router.get('/', async (req, res) => {
    try {
        const { rows } = await getVets(null, null); // Fetch all
        // Match the Spring JSON structure slightly
        res.json({ vetList: rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
