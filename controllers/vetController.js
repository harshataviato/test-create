const { Vet, Specialty } = require('../models');

/**
 * Handle requests for Veterinarians.
 */
module.exports = {
    /**
     * Show the list of Vets.
     * Supports pagination logic similar to the original Controller.
     */
    showVetList: async (req, res, next) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 5;
            const offset = (page - 1) * limit;

            const { count, rows } = await Vet.findAndCountAll({
                include: [Specialty],
                limit,
                offset,
                order: [['lastName', 'ASC']]
            });

            const totalPages = Math.ceil(count / limit);

            res.render('vets/vetList', {
                listVets: rows,
                currentPage: page,
                totalPages: totalPages,
                totalItems: count
            });
        } catch (err) {
            next(err);
        }
    },

    /**
     * API Endpoint: Get all vets as JSON
     */
    getVetsJson: async (req, res, next) => {
        try {
            const vets = await Vet.findAll({ include: [Specialty] });
            res.json({ vetList: vets });
        } catch (err) {
            next(err);
        }
    }
};
