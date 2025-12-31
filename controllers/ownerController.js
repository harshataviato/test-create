/**
 * @module controllers/ownerController
 * @description Controller for managing Owner entities (create, read, update, search).
 */

const { validationResult } = require('express-validator');
const db = require('../config/database');
const moment = require('moment'); // For date formatting in templates

/**
 * @function showFindOwnerForm
 * @description Renders the form to search for owners.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 */
exports.showFindOwnerForm = (req, res) => {
  res.render('owners/findOwners', { owner: {}, title: res.__('owner.findOwnerTitle') });
};

/**
 * @function processFindOwnerForm
 * @description Processes the owner search form, either showing a single owner or a list.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
exports.processFindOwnerForm = async (req, res, next) => {
  const { lastName } = req.query; // Get last name from query parameters

  try {
    let owners;
    if (lastName) {
      // Search by last name (case-insensitive LIKE)
      owners = await db.Owner.findAll({
        where: {
          lastName: {
            [db.Sequelize.Op.like]: `%${lastName}%`
          }
        },
        order: [['lastName', 'ASC']]
      });
    } else {
      // If no last name, find all (for "find owner" button without input)
      owners = await db.Owner.findAll({ order: [['lastName', 'ASC']] });
    }

    if (!owners || owners.length === 0) {
      // No owners found, render form again with error message
      req.flash('error', res.__('owner.notFound')); // Using a hypothetical flash message system or pass directly
      return res.render('owners/findOwners', { owner: {}, title: res.__('owner.findOwnerTitle'), errors: { lastName: res.__('owner.notFound') } });
    }

    if (owners.length === 1) {
      // Exactly one owner found, redirect to their details page
      return res.redirect(`/owners/${owners[0].id}`);
    }

    // Multiple owners found, display list
    res.render('owners/ownersList', { owners, title: res.__('owner.ownerListTitle') });

  } catch (error) {
    console.error('Error finding owners:', error);
    next(error); // Pass error to global error handler
  }
};

/**
 * @function showOwnerDetails
 * @description Displays detailed information for a specific owner, including their pets and visits.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
exports.showOwnerDetails = async (req, res, next) => {
  const ownerId = req.params.ownerId;

  try {
    const owner = await db.Owner.findByPk(ownerId, {
      include: [{
        model: db.Pet,
        as: 'pets',
        include: [{
          model: db.PetType,
          as: 'type'
        }, {
          model: db.Visit,
          as: 'visits',
          order: [['visitDate', 'ASC']] // Order visits by date
        }]
      }]
    });

    if (!owner) {
      // Owner not found, redirect to owners list or error page
      return res.status(404).render('error', { title: res.__('common.error'), message: res.__('owner.notFoundById', { ownerId }) });
    }

    res.render('owners/ownerDetails', { owner, title: res.__('owner.ownerDetailsTitle', { ownerName: owner.fullName }) });

  } catch (error) {
    console.error(`Error fetching owner details for ID ${ownerId}:`, error);
    next(error);
  }
};

/**
 * @function showCreateOwnerForm
 * @description Renders the form to create a new owner.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 */
exports.showCreateOwnerForm = (req, res) => {
  res.render('owners/createOrUpdateOwnerForm', { owner: {}, title: res.__('owner.newOwnerTitle'), isNew: true, errors: {} });
};

/**
 * @function processCreateOwnerForm
 * @description Processes the form submission to create a new owner.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
exports.processCreateOwnerForm = async (req, res, next) => {
  const errors = validationResult(req); // Get validation errors from express-validator

  if (!errors.isEmpty()) {
    // If there are validation errors, re-render the form with error messages
    return res.status(400).render('owners/createOrUpdateOwnerForm', {
      owner: req.body, // Pass submitted data back to form
      title: res.__('owner.newOwnerTitle'),
      isNew: true,
      errors: errors.mapped() // Format errors for easier template access
    });
  }

  try {
    const newOwner = await db.Owner.create(req.body);
    res.redirect(`/owners/${newOwner.id}`); // Redirect to the new owner's details page
  } catch (error) {
    console.error('Error creating new owner:', error);
    // Handle Sequelize validation errors or other DB errors
    if (error.name === 'SequelizeValidationError') {
      const formattedErrors = {};
      error.errors.forEach(err => {
        formattedErrors[err.path] = { msg: err.message };
      });
      return res.status(400).render('owners/createOrUpdateOwnerForm', {
        owner: req.body,
        title: res.__('owner.newOwnerTitle'),
        isNew: true,
        errors: formattedErrors
      });
    }
    next(error);
  }
};

/**
 * @function showUpdateOwnerForm
 * @description Renders the form to update an existing owner.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
exports.showUpdateOwnerForm = async (req, res, next) => {
  const ownerId = req.params.ownerId;

  try {
    const owner = await db.Owner.findByPk(ownerId);
    if (!owner) {
      return res.status(404).render('error', { title: res.__('common.error'), message: res.__('owner.notFoundById', { ownerId }) });
    }
    res.render('owners/createOrUpdateOwnerForm', { owner, title: res.__('owner.editOwnerTitle', { ownerName: owner.fullName }), isNew: false, errors: {} });
  } catch (error) {
    console.error(`Error fetching owner for update ID ${ownerId}:`, error);
    next(error);
  }
};

/**
 * @function processUpdateOwnerForm
 * @description Processes the form submission to update an existing owner.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
exports.processUpdateOwnerForm = async (req, res, next) => {
  const ownerId = req.params.ownerId;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).render('owners/createOrUpdateOwnerForm', {
      owner: { ...req.body, id: ownerId }, // Include ID for existing owner
      title: res.__('owner.editOwnerTitle', { ownerName: req.body.firstName + ' ' + req.body.lastName }),
      isNew: false,
      errors: errors.mapped()
    });
  }

  try {
    const owner = await db.Owner.findByPk(ownerId);
    if (!owner) {
      return res.status(404).render('error', { title: res.__('common.error'), message: res.__('owner.notFoundById', { ownerId }) });
    }

    await owner.update(req.body);
    res.redirect(`/owners/${owner.id}`); // Redirect to the updated owner's details page

  } catch (error) {
    console.error(`Error updating owner ID ${ownerId}:`, error);
    if (error.name === 'SequelizeValidationError') {
      const formattedErrors = {};
      error.errors.forEach(err => {
        formattedErrors[err.path] = { msg: err.message };
      });
      return res.status(400).render('owners/createOrUpdateOwnerForm', {
        owner: { ...req.body, id: ownerId },
        title: res.__('owner.editOwnerTitle', { ownerName: req.body.firstName + ' ' + req.body.lastName }),
        isNew: false,
        errors: formattedErrors
      });
    }
    next(error);
  }
};
