/**
 * Vet Controller
 * Lists Veterinarians and their associated specialties
 */
const { Vet, Specialty } = require('../models');

exports.showVetList = async (req, res) => {
  const listVets = await Vet.findAll({
    include: [{ model: Specialty, through: { attributes: [] } }]
  });

  res.render('vets/vetList', { 
    listVets, 
    totalPages: 1, 
    currentPage: 1, 
    menu: 'vets' 
  });
};
