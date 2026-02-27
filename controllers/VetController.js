const { Vet, Specialty } = require('../models');

class VetController {
  static async showVetList(req, res) {
    const vets = await Vet.findAll({
      include: [Specialty]
    });
    
    // Supports both .html and JSON request logic from original controller
    if (req.path.endsWith('.html') || req.headers.accept?.includes('text/html')) {
      res.render('vets/vetList', { listVets: vets });
    } else {
      res.json({ vetList: vets });
    }
  }
}

module.exports = VetController;
