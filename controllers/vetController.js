/**
 * Vet Controller
 * Displays list of Vets.
 */
const db = require('../models');

module.exports = {
  // GET /vets.html (Paginated HTML)
  showVetList: async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    try {
      const { count, rows } = await db.Vet.findAndCountAll({
        include: [{ model: db.Specialty, as: 'specialties' }],
        limit: limit,
        offset: offset,
        distinct: true
      });

      const totalPages = Math.ceil(count / limit);

      res.render('vets/list', {
        listVets: rows.map(v => v.toJSON()),
        currentPage: page,
        totalPages: totalPages,
        totalItems: count
      });
    } catch (err) {
      res.render('error', { message: "Error fetching vets" });
    }
  },

  // GET /vets (JSON API)
  showResourcesVetList: async (req, res) => {
    try {
      const vets = await db.Vet.findAll({
        include: [{ model: db.Specialty, as: 'specialties' }]
      });
      res.json({ vetList: vets });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
