const { Owner, Pet, Visit, PetType } = require('../models');
const { Op } = require('sequelize');

/**
 * Handles logic for Owner management.
 * Pragmatic implementation of OwnerController.java
 */
class OwnerController {
  
  // GET /owners/new
  static async initCreationForm(req, res) {
    res.render('owners/createOrUpdateOwnerForm', { owner: {}, isNew: true });
  }

  // POST /owners/new
  static async processCreationForm(req, res) {
    try {
      const owner = await Owner.create(req.body);
      res.redirect(`/owners/${owner.id}`);
    } catch (err) {
      res.render('owners/createOrUpdateOwnerForm', { 
        owner: req.body, 
        isNew: true, 
        errors: err.errors 
      });
    }
  }

  // GET /owners/find
  static async initFindForm(req, res) {
    res.render('owners/findOwners', { owner: {} });
  }

  // GET /owners
  static async processFindForm(req, res) {
    let lastName = req.query.lastName || '';
    
    // Logic mirroring: findByLastNameStartingWith
    const results = await Owner.findAll({
      where: {
        lastName: { [Op.like]: `${lastName}%` }
      },
      include: [Pet]
    });

    if (results.length === 0) {
      return res.render('owners/findOwners', { owner: req.query, error: 'Not Found' });
    }

    if (results.length === 1) {
      return res.redirect(`/owners/${results[0].id}`);
    }

    res.render('owners/ownersList', { listOwners: results });
  }

  // GET /owners/:ownerId
  static async showOwner(req, res) {
    const owner = await Owner.findByPk(req.params.ownerId, {
      include: [
        {
          model: Pet,
          include: ['type', Visit]
        }
      ]
    });
    
    if (!owner) return res.status(404).render('error', { message: 'Owner not found' });
    res.render('owners/ownerDetails', { owner });
  }

  // GET /owners/:ownerId/edit
  static async initUpdateForm(req, res) {
    const owner = await Owner.findByPk(req.params.ownerId);
    res.render('owners/createOrUpdateOwnerForm', { owner, isNew: false });
  }

  // POST /owners/:ownerId/edit
  static async processUpdateForm(req, res) {
    try {
      await Owner.update(req.body, { where: { id: req.params.ownerId } });
      res.redirect(`/owners/${req.params.ownerId}`);
    } catch (err) {
      res.render('owners/createOrUpdateOwnerForm', { 
        owner: { ...req.body, id: req.params.ownerId }, 
        isNew: false, 
        errors: err.errors 
      });
    }
  }
}

module.exports = OwnerController;
