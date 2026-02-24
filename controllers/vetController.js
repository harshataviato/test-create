const db = require('../models');

/**
 * Displays the list of vets (HTML).
 */
exports.showVetList = async (req, res) => {
  try {
    const vets = await db.Vet.findAll({
      include: [{ model: db.Specialty, as: 'specialties' }]
    });
    res.render('vets/vetList', { listVets: vets });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

/**
 * Returns the list of vets (JSON).
 */
exports.showResourcesVetList = async (req, res) => {
  try {
    const vets = await db.Vet.findAll({
      include: [{ model: db.Specialty, as: 'specialties' }]
    });
    res.json({ vetList: vets });
  } catch (err) {
    res.status(500).send(err.message);
  }
};
