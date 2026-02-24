const { Owner, Pet, PetType, Visit } = require('../models');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');

/**
 * Owner Controller
 * Handles Owner creation, searching, details, and updates.
 */
module.exports = {
  
  // GET /owners/new
  initCreationForm: (req, res) => {
    res.render('owners/createOrUpdateOwnerForm', { owner: {} });
  },

  // POST /owners/new
  processCreationForm: async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('owners/createOrUpdateOwnerForm', {
        owner: req.body,
        errors: errors.mapped()
      });
    }

    try {
      const owner = await Owner.create(req.body);
      res.redirect(`/owners/${owner.id}`);
    } catch (err) {
      next(err);
    }
  },

  // GET /owners/find
  initFindForm: (req, res) => {
    res.render('owners/findOwners', { owner: {} });
  },

  // GET /owners
  processFindForm: async (req, res, next) => {
    try {
      const { lastName } = req.query;
      const where = {};
      
      if (lastName) {
        where.lastName = { [Op.like]: `${lastName}%` };
      }

      const owners = await Owner.findAll({ where });

      if (owners.length === 0) {
        return res.render('owners/findOwners', {
          errors: { lastName: { msg: 'has not been found' } }
        });
      }

      if (owners.length === 1) {
        return res.redirect(`/owners/${owners[0].id}`);
      }

      // List multiple owners (Simplified pagination for Node example)
      res.render('owners/ownersList', { listOwners: owners.map(o => o.toJSON()) });

    } catch (err) {
      next(err);
    }
  },

  // GET /owners/:id
  showOwner: async (req, res, next) => {
    try {
      const owner = await Owner.findByPk(req.params.id, {
        include: [{
          model: Pet,
          as: 'pets',
          include: [{ model: PetType, as: 'type' }, { model: Visit, as: 'visits' }]
        }]
      });

      if (!owner) return res.status(404).send('Owner not found');

      res.render('owners/ownerDetails', { owner: owner.toJSON() });
    } catch (err) {
      next(err);
    }
  },

  // GET /owners/:id/edit
  initUpdateOwnerForm: async (req, res, next) => {
    try {
      const owner = await Owner.findByPk(req.params.id);
      res.render('owners/createOrUpdateOwnerForm', { owner: owner.toJSON() });
    } catch (err) {
      next(err);
    }
  },

  // POST /owners/:id/edit
  processUpdateOwnerForm: async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('owners/createOrUpdateOwnerForm', {
        owner: { ...req.body, id: req.params.id },
        errors: errors.mapped()
      });
    }

    try {
      await Owner.update(req.body, { where: { id: req.params.id } });
      res.redirect(`/owners/${req.params.id}`);
    } catch (err) {
      next(err);
    }
  }
};
