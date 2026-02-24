/**
 * Vet Controller
 * 
 * Handles listing Veterinarians.
 * Supports HTML view (paginated) and JSON API endpoint.
 */
const { Vet, Specialty } = require('../models');

exports.showVetList = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const offset = (page - 1) * limit;

  try {
    const { count, rows } = await Vet.findAndCountAll({
      include: [{ model: Specialty }],
      limit,
      offset
    });

    res.render('vets/vetList', {
      listVets: rows,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count
    });
  } catch (err) {
    console.error(err);
    res.render('error', { message: 'Error loading vets' });
  }
};

// JSON API Endpoint
exports.showResourcesVetList = async (req, res) => {
  try {
    const vets = await Vet.findAll({ include: [{ model: Specialty }] });
    res.json({ vetList: vets });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
