const { Vet, Specialty } = require('../models');

/**
 * Veterinarian list controller.
 */
exports.listHtml = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const { count, rows } = await Vet.findAndCountAll({
    include: [{ model: Specialty, as: 'specialties' }],
    limit,
    offset: (page - 1) * limit
  });

  res.render('vets/vetList', {
    listVets: rows,
    currentPage: page,
    totalPages: Math.ceil(count / limit),
    totalItems: count
  });
};

exports.listJson = async (req, res) => {
  const vets = await Vet.findAll({ include: [{ model: Specialty, as: 'specialties' }] });
  res.json({ vetList: vets });
};
