/**
 * Owner Controller
 * Handles operations related to Owners.
 */
const db = require('../models');
const { Op } = require('sequelize');

module.exports = {
  // GET /owners/new
  initCreationForm: (req, res) => {
    res.render('owners/form', { owner: {} });
  },

  // POST /owners/new
  processCreationForm: async (req, res) => {
    try {
      const owner = await db.Owner.create(req.body);
      res.redirect(`/owners/${owner.id}`);
    } catch (error) {
      // Basic validation error handling
      res.render('owners/form', { 
        owner: req.body, 
        errors: error.errors,
        errorMsg: "There was an error in creating the owner."
      });
    }
  },

  // GET /owners/find
  initFindForm: (req, res) => {
    res.render('owners/find', { owner: {} });
  },

  // GET /owners
  processFindForm: async (req, res) => {
    const lastName = req.query.lastName || '';
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    try {
      const { count, rows } = await db.Owner.findAndCountAll({
        where: {
          lastName: {
            [Op.like]: `${lastName}%`
          }
        },
        include: [{ model: db.Pet, as: 'pets' }],
        limit: limit,
        offset: offset,
        distinct: true // Important for correct count with includes
      });

      if (count === 0) {
        res.render('owners/find', { 
          owner: { lastName }, 
          errors: [{ message: 'has not been found', path: 'lastName' }] 
        });
      } else if (count === 1) {
        res.redirect(`/owners/${rows[0].id}`);
      } else {
        const totalPages = Math.ceil(count / limit);
        res.render('owners/list', {
          listOwners: rows,
          currentPage: page,
          totalPages: totalPages,
          totalItems: count,
          query: lastName
        });
      }
    } catch (err) {
      console.error(err);
      res.render('error', { message: "Error finding owners" });
    }
  },

  // GET /owners/:ownerId
  showOwner: async (req, res) => {
    try {
      const owner = await db.Owner.findByPk(req.params.ownerId, {
        include: [{
          model: db.Pet,
          as: 'pets',
          include: [{ model: db.PetType, as: 'type' }, { model: db.Visit, as: 'visits' }]
        }]
      });
      if (!owner) throw new Error('Owner not found');
      res.render('owners/details', { owner: owner.toJSON() });
    } catch (err) {
      res.status(404).render('error', { message: err.message, status: 404 });
    }
  },

  // GET /owners/:ownerId/edit
  initUpdateOwnerForm: async (req, res) => {
    try {
      const owner = await db.Owner.findByPk(req.params.ownerId);
      if (!owner) throw new Error('Owner not found');
      res.render('owners/form', { owner: owner.toJSON() });
    } catch (err) {
      res.status(404).render('error', { message: err.message });
    }
  },

  // POST /owners/:ownerId/edit
  processUpdateOwnerForm: async (req, res) => {
    try {
      await db.Owner.update(req.body, { where: { id: req.params.ownerId } });
      res.redirect(`/owners/${req.params.ownerId}`);
    } catch (error) {
      const owner = req.body;
      owner.id = req.params.ownerId;
      res.render('owners/form', { 
        owner: owner, 
        errors: error.errors 
      });
    }
  }
};
