/**
 * Vet Controller
 * Displays list of veterinarians.
 */
const { Vet, Specialty } = require('../models');

exports.showVetList = async (req, res) => {
  const vets = await Vet.findAll({
    include: [{ model: Specialty, as: 'specialties' }]
  });

  res.render('vets/vetList', { listVets: vets });
};

// API Endpoint returning JSON
exports.showResourcesVetList = async (req, res) => {
  const vets = await Vet.findAll({
    include: [{ model: Specialty, as: 'specialties' }]
  });
  res.json({ vetList: vets });
};
