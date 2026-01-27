/**
 * @fileoverview Controller for handling Owner-related operations.
 * This includes listing, finding, displaying details, and managing owner records.
 */

const { validationResult } = require('express-validator');
const db = require('../models');
const Owner = db.Owner;
const Pet = db.Pet;
const PetType = db.PetType;
const Visit = db.Visit;
const { Op } = require('sequelize');

// Helper function to load pet types for forms
async function loadPetTypes() {
  return db.PetType.findAll({ order: [['name', 'ASC']] });
}

/**
 * @function index
 * @description Redirects to the find owners form.
 * @param {express.Request} req - The Express request object.
 * @param {express.Response} res - The Express response object.
 */
exports.index = (req, res) => {
  res.redirect('/owners/find');
};

/**
 * @function find
 * @description Renders the 'find owners' form.
 * @param {express.Request} req - The Express request object.
 * @param {express.Response} res - The Express response object.
 */
exports.find = (req, res) => {
  res.render('owners/findOwners', { owner: Owner.build(), title: req.__('owner.find') });
};

/**
 * @function processFindForm
 * @description Processes the 'find owners' form submission.
 * Searches for owners by last name and redirects to details if one owner is found,
 * displays a list if multiple, or redisplays the form with an error if none found.
 * @param {express.Request} req - The Express request object.
 * @param {express.Response} res - The Express response object.
 * @param {express.NextFunction} next - The Express next middleware function.
 */
exports.processFindForm = async (req, res, next) => {
  const { lastName } = req.body;

  // Find owners by last name
  try {
    const owners = await Owner.findAll({
      where: {
        lastName: {
          [Op.iLike]: `${lastName}%` // Case-insensitive partial match
        }
      },
      order: [['lastName', 'ASC']],
      include: [{ model: Pet, as: 'pets' }] // Include pets to simulate behavior for single result redirect
    });

    if (owners.length === 0) {
      req.flash('error', req.__('owner.notFound'));
      // Render the find form again with the error message
      return res.render('owners/findOwners', { owner: Owner.build({ lastName }), title: req.__('owner.find'), errors: req.flash('error') });
    }

    if (owners.length === 1) {
      // If only one owner found, redirect to owner details page
      return res.redirect(`/owners/${owners[0].id}`);
    }

    // If multiple owners found, display list
    res.render('owners/ownersList', { owners: owners, title: req.__('owner.list') });

  } catch (error) {
    next(error);
  }
};


/**
 * @function show
 * @description Displays an individual owner's details, including their pets and visits.
 * @param {express.Request} req - The Express request object.
 * @param {express.Response} res - The Express response object.
 * @param {express.NextFunction} next - The Express next middleware function.
 */
exports.show = async (req, res, next) => {
  try {
    const owner = await Owner.findByPk(req.params.ownerId, {
      include: [{
        model: Pet,
        as: 'pets',
        include: [{
          model: PetType,
          as: 'type'
        }, {
          model: Visit,
          as: 'visits',
          order: [['visit_date', 'ASC']] // Order visits by date
        }]
      }],
      order: [[{ model: Pet, as: 'pets' }, 'name', 'ASC']] // Order pets by name
    });

    if (!owner) {
      req.flash('error', req.__('owner.notFoundById', req.params.ownerId));
      return res.redirect('/owners'); // Redirect to find form
    }

    res.render('owners/ownerDetails', { owner: owner, title: req.__('owner.details') });

  } catch (error) {
    next(error);
  }
};


/**
 * @function newOwnerForm
 * @description Renders the form for creating a new owner.
 * @param {express.Request} req - The Express request object.
 * @param {express.Response} res - The Express response object.
 */
exports.newOwnerForm = (req, res) => {
  res.render('owners/createOrUpdateOwnerForm', { owner: Owner.build(), title: req.__('owner.new') });
};

/**
 * @function create
 * @description Handles the submission of the new owner form, creates a new owner record.
 * @param {express.Request} req - The Express request object.
 * @param {express.Response} res - The Express response object.
 * @param {express.NextFunction} next - The Express next middleware function.
 */
exports.create = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // There are validation errors, re-render the form with error messages
    return res.render('owners/createOrUpdateOwnerForm', {
      owner: Owner.build(req.body), // Re-populate form with submitted data
      title: req.__('owner.new'),
      errors: errors.array()
    });
  }

  try {
    const newOwner = await Owner.create(req.body);
    req.flash('message', req.__('owner.created', newOwner.firstName, newOwner.lastName));
    res.redirect(`/owners/${newOwner.id}`);
  } catch (error) {
    next(error);
  }
};

/**
 * @function editOwnerForm
 * @description Renders the form for editing an existing owner.
 * @param {express.Request} req - The Express request object.
 * @param {express.Response} res - The Express response object.
 * @param {express.NextFunction} next - The Express next middleware function.
 */
exports.editOwnerForm = async (req, res, next) => {
  try {
    const owner = await Owner.findByPk(req.params.ownerId);

    if (!owner) {
      req.flash('error', req.__('owner.notFoundById', req.params.ownerId));
      return res.redirect('/owners');
    }

    res.render('owners/createOrUpdateOwnerForm', { owner: owner, title: req.__('owner.edit') });
  } catch (error) {
    next(error);
  }
};

/**
 * @function update
 * @description Handles the submission of the edit owner form, updates an existing owner record.
 * @param {express.Request} req - The Express request object.
 * @param {express.Response} res - The Express response object.
 * @param {express.NextFunction} next - The Express next middleware function.
 */
exports.update = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // There are validation errors, re-render the form with error messages
    const owner = Owner.build({ id: req.params.ownerId, ...req.body }); // Preserve ID
    return res.render('owners/createOrUpdateOwnerForm', {
      owner: owner,
      title: req.__('owner.edit'),
      errors: errors.array()
    });
  }

  try {
    const owner = await Owner.findByPk(req.params.ownerId);

    if (!owner) {
      req.flash('error', req.__('owner.notFoundById', req.params.ownerId));
      return res.redirect('/owners');
    }

    await owner.update(req.body);
    req.flash('message', req.__('owner.updated', owner.firstName, owner.lastName));
    res.redirect(`/owners/${owner.id}`);

  } catch (error) {
    next(error);
  }
};

