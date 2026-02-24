const { Vet, Specialty } = require('../models');

// HTML Response
exports.showVetList = async (req, res, next) => {
  try {
    // Basic pagination logic
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    const { count, rows } = await Vet.findAndCountAll({
      include: [{ model: Specialty, as: 'specialties' }],
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
};

// JSON Response (API)
exports.showResourcesVetList = async (req, res, next) => {
  try {
    const vets = await Vet.findAll({
      include: [{ model: Specialty, as: 'specialties' }]
    });
    res.json({ vetList: vets });
  } catch (err) {
    next(err);
  }
};
