/**
 * Owner Management Controller.
 * 
 * Features:
 * - CRUD operations for Owners.
 * - Search by Last Name (SQL LIKE).
 * - Form Validation (delegated to middleware, handled here).
 */

const { Owner, Pet, Visit } = require('../models');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');

/**
 * Display form to find owners.
 */
exports.findOwnerForm = (req, res) => {
  res.render('owners/find', { owner: {} });
};

/**
 * Process search for owners.
 */
exports.processFindForm = async (req, res, next) => {
  try {
    const { lastName } = req.query;
    
    // Allow empty search to find all
    const condition = lastName ? { lastName: { [Op.like]: `${lastName}%` } } : {};

    const owners = await Owner.findAll({ where: condition });

    if (owners.length === 0) {
      // Logic: No results found
      return res.render('owners/find', { 
        errors: [{ msg: res.__('owners.not_found') }],
        owner: { lastName } 
      });
    } else if (owners.length === 1) {
      // Logic: One result, redirect to details
      return res.redirect(`/owners/${owners[0].id}`);
    } else {
      // Logic: Multiple results, show list
      return res.render('owners/list', { owners });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Display Owner Details + Pets + Visits.
 */
exports.showOwner = async (req, res, next) => {
  try {
    const owner = await Owner.findByPk(req.params.id, {
      include: [{
        model: Pet,
        include: [Visit]
      }]
    });

    if (!owner) return res.status(404).send('Owner not found');

    res.render('owners/details', { owner });
  } catch (err) {
    next(err);
  }
};

/**
 * Show create form.
 */
exports.newOwnerForm = (req, res) => {
  res.render('owners/createOrUpdate', { owner: {}, mode: 'create' });
};

/**
 * Handle creation.
 */
exports.processCreation = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('owners/createOrUpdate', { 
      owner: req.body, 
      errors: errors.array(),
      mode: 'create'
    });
  }

  try {
    const owner = await Owner.create(req.body);
    res.redirect(`/owners/${owner.id}`);
  } catch (err) {
    next(err);
  }
};

/**
 * Show update form.
 */
exports.editOwnerForm = async (req, res, next) => {
  try {
    const owner = await Owner.findByPk(req.params.id);
    res.render('owners/createOrUpdate', { owner, mode: 'edit' });
  } catch (err) {
    next(err);
  }
};

/**
 * Handle update.
 */
exports.processUpdate = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Preserve ID for the update URL
    const owner = req.body;
    owner.id = req.params.id;
    return res.render('owners/createOrUpdate', { 
      owner: owner, 
      errors: errors.array(),
      mode: 'edit'
    });
  }

  try {
    await Owner.update(req.body, { where: { id: req.params.id } });
    res.redirect(`/owners/${req.params.id}`);
  } catch (err) {
    next(err);
  }
};
