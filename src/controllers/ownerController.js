/**
 * @file OwnerController module.
 * @description Handles requests related to `Owner` entities, including creation, retrieval,
 * updates, and displaying owner details and lists.
 * Mirrors Spring's `OwnerController.java`.
 * @author Google Senior Engineer
 */

const ownerRepository = require('../repositories/ownerRepository');
const petTypeRepository = require('../repositories/petTypeRepository');
const Owner = require('../models/owner');
const Pet = require('../models/pet');
const Visit = require('../models/visit');
const config = require('../config');

// Constants for view names
const VIEWS_OWNER_CREATE_OR_UPDATE_FORM = 'owners/createOrUpdateOwnerForm';
const VIEWS_OWNER_FIND_OWNERS = 'owners/findOwners';
const VIEWS_OWNER_LIST = 'owners/ownersList';
const VIEWS_OWNER_DETAILS = 'owners/ownerDetails';

/**
 * Middleware to find an owner by ID and attach it to `req.locals.owner`.
 * This mimics Spring's `@ModelAttribute("owner") public Owner findOwner(...)`.
 * It's used for views that depend on an existing owner (edit forms, detail view, pet forms).
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @param {string} ownerId - The owner ID from the URL parameter.
 * @returns {void}
 */
async function findOwner(req, res, next, ownerId) {
  if (ownerId) {
    try {
      const owner = await ownerRepository.findById(parseInt(ownerId));
      if (!owner) {
        // Owner not found, pass an error to the error handler
        const error = new Error(res.__('owner') + ' ' + res.__('notFound'));
        error.statusCode = 404; // Set a 404 status code
        return next(error);
      }
      req.locals = req.locals || {};
      req.locals.owner = owner; // Attach owner to res.locals for views and subsequent middleware
      res.locals.owner = owner; // Also make it available directly to the view
    } catch (error) {
      return next(error); // Pass any database errors to the error handler
    }
  } else {
    // If no ownerId, it's a new owner scenario
    req.locals = req.locals || {};
    req.locals.owner = new Owner(); // Create a new empty owner
    res.locals.owner = new Owner();
  }
  next();
}

/**
 * Displays the form for creating a new owner.
 * Corresponds to `initCreationForm()` in Java.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {void}
 */
function initCreationForm(req, res) {
  res.render(VIEWS_OWNER_CREATE_OR_UPDATE_FORM, { owner: req.locals.owner });
}

/**
 * Processes the form submission for creating a new owner.
 * Corresponds to `processCreationForm()` in Java.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {void}
 */
async function processCreationForm(req, res, next) {
  try {
    const ownerData = req.body;
    const owner = new Owner(ownerData); // Create owner object from form data

    // ID is typically null for new owners, handled by constructor
    // No explicit `owner.setId(null)` needed

    const savedOwner = await ownerRepository.save(owner); // Save the new owner

    req.flash('message', res.__('new') + ' ' + res.__('owner') + ' ' + res.__('has been added')); // Flash success message
    res.redirect(`/owners/${savedOwner.getId()}`); // Redirect to owner details page
  } catch (error) {
    next(error); // Pass database errors to the error handler
  }
}

/**
 * Displays the form for finding owners.
 * Corresponds to `initFindForm()` in Java.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {void}
 */
function initFindForm(req, res) {
  res.render(VIEWS_OWNER_FIND_OWNERS, { owner: new Owner() }); // Render with an empty owner object for the form
}

/**
 * Processes the form submission for finding owners by last name, with pagination.
 * Corresponds to `processFindForm()` in Java.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {void}
 */
async function processFindForm(req, res, next) {
  const page = parseInt(req.query.page || '1', 10);
  const lastName = req.query.lastName || '';
  const pageSize = config.pagination.pageSize;

  try {
    const paginatedResult = await ownerRepository.findByLastNameStartingWith(lastName, page, pageSize);
    const { totalItems, listOwners, totalPages, currentPage } = paginatedResult;

    if (listOwners.length === 0) {
      // No owners found
      res.locals.errors = { lastName: [res.__('notFound')] }; // Add error for the view
      return res.render(VIEWS_OWNER_FIND_OWNERS, { owner: new Owner({ lastName }) }); // Re-render find form with error
    }

    if (listOwners.length === 1 && !lastName) {
      // Exactly one owner found with empty last name search (i.e., all records)
      // The original Java code implicitly redirects to the single owner details if only one is found in a broad search.
      // We implement this explicit redirect for `lastName` empty string.
      return res.redirect(`/owners/${listOwners[0].getId()}`);
    }

    if (listOwners.length === 1 && lastName === listOwners[0].lastName) {
      // Exactly one owner found matching the last name
      return res.redirect(`/owners/${listOwners[0].getId()}`);
    }

    // Multiple owners found or paginated results
    res.render(VIEWS_OWNER_LIST, {
      listOwners,
      currentPage,
      totalPages,
      totalItems
    });

  } catch (error) {
    next(error); // Pass database errors to the error handler
  }
}

/**
 * Displays the form for updating an existing owner.
 * Corresponds to `initUpdateOwnerForm()` in Java.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {void}
 */
function initUpdateOwnerForm(req, res) {
  res.render(VIEWS_OWNER_CREATE_OR_UPDATE_FORM, { owner: req.locals.owner });
}

/**
 * Processes the form submission for updating an existing owner.
 * Corresponds to `processUpdateOwnerForm()` in Java.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {void}
 */
async function processUpdateOwnerForm(req, res, next) {
  const ownerId = parseInt(req.params.ownerId);
  const ownerData = req.body;

  try {
    // Check for ID mismatch between path and form (equivalent to `!Objects.equals(owner.getId(), ownerId)`)
    if (ownerData.id && parseInt(ownerData.id) !== ownerId) {
      req.flash('error', res.__('Owner ID mismatch. Please try again.'));
      return res.redirect(`/owners/${ownerId}/edit`);
    }

    const existingOwner = req.locals.owner; // Owner object from findOwner middleware

    // Update existing owner properties
    existingOwner.setFirstName(ownerData.firstName);
    existingOwner.setLastName(ownerData.lastName);
    existingOwner.setAddress(ownerData.address);
    existingOwner.setCity(ownerData.city);
    existingOwner.setTelephone(ownerData.telephone);

    await ownerRepository.save(existingOwner); // Save updated owner (updates existing record)

    req.flash('message', res.__('Owner Values Updated'));
    res.redirect(`/owners/${ownerId}`); // Redirect to updated owner's details page
  } catch (error) {
    next(error); // Pass database errors to the error handler
  }
}

/**
 * Displays an owner's details, including their pets and visits.
 * Corresponds to `showOwner()` in Java.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {void}
 */
function showOwner(req, res) {
  // owner is already loaded by `findOwner` middleware and available in `res.locals.owner`
  res.render(VIEWS_OWNER_DETAILS, { owner: res.locals.owner });
}

module.exports = {
  findOwner,
  initCreationForm,
  processCreationForm,
  initFindForm,
  processFindForm,
  initUpdateOwnerForm,
  processUpdateOwnerForm,
  showOwner
};

