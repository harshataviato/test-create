const db = require('../models');
const { Op } = require('sequelize');

/**
 * Handles logic for Owner-related views and actions.
 */
class OwnerController {
  
  // Show the search form
  initFindForm(req, res) {
    res.render('owners/findOwners', { owner: {} });
  }

  // Process search results
  async processFindForm(req, res) {
    let { lastName = '', page = 1 } = req.query;
    const limit = 5;
    const offset = (page - 1) * limit;

    // Search logic: broad match if lastName is empty, else "starts with"
    const { count, rows: owners } = await db.Owner.findAndCountAll({
      where: { lastName: { [Op.like]: `${lastName}%` } },
      include: [{ model: db.Pet, as: 'pets' }],
      limit,
      offset,
      order: [['lastName', 'ASC']]
    });

    if (count === 0) {
      return res.render('owners/findOwners', { owner: { lastName }, error: 'Not found' });
    }

    if (count === 1 && page == 1) {
      return res.redirect(`/owners/${owners[0].id}`);
    }

    res.render('owners/ownersList', {
      listOwners: owners,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      lastName
    });
  }

  // View specific owner details
  async showOwner(req, res) {
    const owner = await db.Owner.findByPk(req.params.ownerId, {
      include: [{ 
        model: db.Pet, as: 'pets', 
        include: ['type', 'visits'] 
      }]
    });
    if (!owner) throw new Error('Owner not found');
    res.render('owners/ownerDetails', { owner, message: req.query.message });
  }

  // Setup form for new owner
  initCreationForm(req, res) {
    res.render('owners/createOrUpdateOwnerForm', { owner: {}, isNew: true });
  }

  // Save new owner
  async processCreationForm(req, res) {
    try {
      const owner = await db.Owner.create(req.body);
      res.redirect(`/owners/${owner.id}`);
    } catch (err) {
      res.render('owners/createOrUpdateOwnerForm', { owner: req.body, isNew: true, errors: err.errors });
    }
  }

  // Setup form for editing owner
  async initUpdateOwnerForm(req, res) {
    const owner = await db.Owner.findByPk(req.params.ownerId);
    res.render('owners/createOrUpdateOwnerForm', { owner, isNew: false });
  }

  // Update existing owner
  async processUpdateOwnerForm(req, res) {
    try {
      await db.Owner.update(req.body, { where: { id: req.params.ownerId } });
      res.redirect(`/owners/${req.params.ownerId}?message=Owner Values Updated`);
    } catch (err) {
      res.render('owners/createOrUpdateOwnerForm', { owner: req.body, isNew: false, errors: err.errors });
    }
  }
}

module.exports = new OwnerController();
