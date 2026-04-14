/**
 * @file controllers/ownerController.js
 * @description Controller for managing owner-related operations.
 * Handles HTTP requests for creating, finding, updating, and displaying owner information.
 * Mimics Spring PetClinic's `OwnerController.java`.
 */

const ownerService = require('../services/ownerService');
const petService = require('../services/petService');
const { validationResult } = require('express-validator');
const Owner = require('../models/owner'); // For creating new instances

const VIEWS_OWNER_CREATE_OR_UPDATE_FORM = 'owners/createOrUpdateOwnerForm';

/**
 * @middleware findOwnerMiddleware
 * @description Middleware to find an owner by ID from the URL parameter and attach it to `req.owner`.
 * This mimics Spring's `@ModelAttribute("owner")` with `@PathVariable`.
 * It handles both existing owners for edits and creating a new empty owner for creation forms.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
exports.findOwnerMiddleware = async (req, res, next) => {
  const ownerId = req.params.ownerId;
  if (ownerId) {
    try {
      const owner = await ownerService.findOwnerById(ownerId);
      if (!owner) {
        throw new Error(req.__('Owner not found with id: ') + ownerId + req.__('. Please ensure the ID is correct and the owner exists in the database.'));
      }
      req.owner = owner;
      res.locals.owner = owner; // Make owner available in templates
      next();
    } catch (error) {
      next(error);
    }
  } else {
    // For 'new' owner creation, create a blank owner object
    req.owner = new Owner();
    res.locals.owner = req.owner; // Make available in templates for form binding
    next();
  }
};

/**
 * @function initCreationForm
 * @description Renders the form for creating a new owner.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
exports.initCreationForm = (req, res) => {
  // `req.owner` is already initialized by `findOwnerMiddleware` as a new Owner()
  res.render(VIEWS_OWNER_CREATE_OR_UPDATE_FORM, { owner: req.owner, title: req.__('addOwner') });
};

/**
 * @function processCreationForm
 * @description Processes the form submission for creating a new owner.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
exports.processCreationForm = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // If there are validation errors, re-render the form with error messages
    req.flash('error', errors.array().map(e => req.__(e.msg)).join(', '));
    return res.render(VIEWS_OWNER_CREATE_OR_UPDATE_FORM, {
      owner: req.owner, // Pre-populated from middleware
      errors: errors.array(),
      title: req.__('addOwner')
    });
  }

  try {
    const newOwner = await ownerService.createOwner(req.body);
    req.flash('success', req.__('New Owner Created'));
    res.redirect(`/owners/${newOwner.id}`);
  } catch (error) {
    next(error);
  }
};

/**
 * @function initFindForm
 * @description Renders the form for finding owners.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
exports.initFindForm = (req, res) => {
  res.render('owners/findOwners', { owner: new Owner(), title: req.__('findOwners') });
};

/**
 * @function processFindForm
 * @description Processes the search request for owners.
 * Supports searching by last name and pagination.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
exports.processFindForm = async (req, res, next) => {
  let lastName = req.query.lastName || '';
  const page = parseInt(req.query.page) || 1;
  const pageSize = 5; // Matches Spring's default page size

  try {
    const { owners, totalItems, totalPages } = await ownerService.findPaginatedForOwnersLastName(lastName, page, pageSize);

    if (owners.length === 0) {
      // No owners found
      req.flash('error', req.__('notFound'));
      return res.render('owners/findOwners', { owner: { lastName: lastName }, title: req.__('findOwners') });
    }

    if (owners.length === 1 && totalPages === 1) {
      // Exactly one owner found, redirect to their details page
      return res.redirect(`/owners/${owners[0].id}`);
    }

    // Multiple owners found or paginated results
    res.render('owners/ownersList', {
      listOwners: owners,
      currentPage: page,
      totalPages: totalPages,
      totalItems: totalItems,
      title: req.__('owners')
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @function initUpdateOwnerForm
 * @description Renders the form for updating an existing owner.
 * The owner object is pre-loaded by `findOwnerMiddleware`.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
exports.initUpdateOwnerForm = (req, res) => {
  res.render(VIEWS_OWNER_CREATE_OR_UPDATE_FORM, { owner: req.owner, title: req.__('updateOwner') });
};

/**
 * @function processUpdateOwnerForm
 * @description Processes the form submission for updating an existing owner.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
exports.processUpdateOwnerForm = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array().map(e => req.__(e.msg)).join(', '));
    return res.render(VIEWS_OWNER_CREATE_OR_UPDATE_FORM, {
      owner: req.owner, // Pre-populated from middleware
      errors: errors.array(),
      title: req.__('updateOwner')
    });
  }

  const ownerId = parseInt(req.params.ownerId, 10);
  // Ensure the ID in the form (if present) matches the URL ID
  if (req.body.id && parseInt(req.body.id, 10) !== ownerId) {
    req.flash('error', req.__('Owner ID mismatch. Please try again.'));
    return res.redirect(`/owners/${ownerId}/edit`);
  }

  try {
    const updatedOwner = await ownerService.updateOwner(ownerId, req.body);
    req.flash('success', req.__('Owner Values Updated'));
    res.redirect(`/owners/${updatedOwner.id}`);
  } catch (error) {
    next(error);
  }
};

/**
 * @function showOwner
 * @description Displays the details of a single owner, including their pets and visits.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
exports.showOwner = async (req, res, next) => {
  const ownerId = req.params.ownerId;
  try {
    // Fetch owner including pets and their visits
    const owner = await ownerService.findOwnerByIdWithPetsAndVisits(ownerId);
    if (!owner) {
      throw new Error(req.__('Owner not found with id: ') + ownerId + req.__('. Please ensure the ID is correct.'));
    }

    // Attach flash messages to locals to be rendered
    res.locals.message = req.flash('success');
    res.locals.error = req.flash('error');

    res.render('owners/ownerDetails', { owner, title: owner.firstName + ' ' + owner.lastName });
  } catch (error) {
    next(error);
  }
};
