import { Vet, Specialty } from '../models/index.js';

export const showVetList = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const offset = (page - 1) * limit;

  const { count, rows } = await Vet.findAndCountAll({
    include: [{ model: Specialty, as: 'specialties' }],
    limit,
    offset
  });

  res.render('vets/vetList', {
    listVets: rows,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    totalItems: count
  });
};

export const showResourcesVetList = async (req, res) => {
  const vets = await Vet.findAll({
    include: [{ model: Specialty, as: 'specialties' }]
  });
  res.json({ vetList: vets });
};
