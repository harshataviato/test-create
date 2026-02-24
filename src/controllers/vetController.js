const { Vet, Specialty } = require('../models');

/**
 * Controller for Vet related operations.
 */
module.exports = {
  /**
   * Show list of Vets (HTML View)
   * GET /vets.html
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
        distinct: true // Accurate count with associations
      });

      res.render('vets/vetList', {
        listVets: rows.map(v => v.toJSON()),
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * JSON API for Vets
   * GET /vets
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
