/**
 * @file src/controllers/owner.controller.js
 * @description Handles HTTP requests related to owner management.
 * This file replaces `OwnerController.java`.
 */

const ownerService = require('../services/owner.service');
const petService = require('../services/pet.service'); // Needed for pet type population
const ownerValidator = require('../validators/owner.validator');
const { validationResult } = require('express-validator');

const VIEWS_OWNER_CREATE_OR_UPDATE_FORM = 'owners/createOrUpdateOwnerForm';

/**
 * @function loadOwner
 * @description Middleware to load an owner object based on `ownerId` from path parameters.
 * If `ownerId` is present, fetches the owner from the database.
 * If `ownerId` is not present, initializes a new Owner object.
 * Attaches the owner to `res.locals` for use in subsequent middleware/templates.
 *
 * This mimics Spring's `@ModelAttribute("owner")` with `@PathVariable`.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function.
 */
async function loadOwner(req, res, next) {
  const ownerId = parseInt(req.params.ownerId, 10);

  if (isNaN(ownerId)) {
    // If ownerId is not a number, it means we are creating a new owner
    res.locals.owner = { isNew: () => true }; // Create a new owner placeholder
    next();
    return;
  }

  try {
    const owner = await ownerService.getOwnerById(ownerId);
    if (!owner) {
      // If owner not found, create an error and pass to next middleware
      const err = new Error(res.__('notFound', { entity: 'Owner' }));
      err.status = 404;
      return next(err);
    }
    res.locals.owner = owner; // Attach owner to response locals
    next();
  } catch (error) {
    console.error('Error loading owner:', error);
    next(error); // Pass any errors to the error handling middleware
  }
}

/**
 * @function initCreationForm
 * @description Renders the form for creating a new owner.
 * Mimics `@GetMapping("/owners/new")`.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
function initCreationForm(req, res) {
  // `res.locals.owner` would be a new Owner object from `loadOwner` middleware.
  res.render(VIEWS_OWNER_CREATE_OR_UPDATE_FORM, { owner: res.locals.owner });
}

/**
 * @async @function processCreationForm
 * @description Processes the form submission for creating a new owner.
 * Mimics `@PostMapping("/owners/new")`.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function.
 */
async function processCreationForm(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // If there are validation errors, re-render the form with errors
    req.flash = { error: res.__('error', { context: 'creating the owner' }) }; // Add flash message
    return res.render(VIEWS_OWNER_CREATE_OR_UPDATE_FORM, {
      owner: { ...req.body, isNew: () => true }, // Re-populate form with submitted data
      errors: errors.array(), // Pass errors to the template
      flash: req.flash
    });
  }

  try {
    const newOwner = await ownerService.createOwner(req.body);
    req.flash = { message: res.__('New Owner Created') }; // Add flash message
    res.redirect(`/owners/${newOwner.id}`);
  } catch (error) {
    console.error('Error creating owner:', error);
    req.flash = { error: res.__('error', { context: 'creating the owner' }) };
    return res.render(VIEWS_OWNER_CREATE_OR_UPDATE_FORM, {
      owner: { ...req.body, isNew: () => true },
      flash: req.flash
    });
  }
}

/**
 * @function initFindForm
 * @description Renders the form for finding owners.
 * Mimics `@GetMapping("/owners/find")`.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
function initFindForm(req, res) {
  res.render('owners/findOwners', { owner: { isNew: () => true } }); // Empty owner for the search form
}

/**
 * @async @function processFindForm
 * @description Processes the form submission for finding owners.
 * Mimics `@GetMapping("/owners")`.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function.
 */
async function processFindForm(req, res, next) {
  const lastName = req.query.lastName || '';
  const page = parseInt(req.query.page, 10) || 1;
  const pageSize = 5; // Fixed page size

  try {
    const { totalItems, totalPages, currentPage, owners } = await ownerService.findOwnersByLastNamePaginated(
      lastName,
      page,
      pageSize
    );

    if (owners.length === 0) {
      // No owners found
      const errors = [{ param: 'lastName', msg: res.__('notFound', { entity: 'Owner' }), value: lastName }];
      return res.render('owners/findOwners', {
        owner: { ...req.query, isNew: () => true },
        errors: errors,
      });
    }

    if (owners.length === 1 && !lastName) { // If exact match and no specific search was done
      // 1 owner found, redirect to details page
      return res.redirect(`/owners/${owners[0].id}`);
    }
    
    if (owners.length === 1 && owners[0].lastName.toLowerCase() === lastName.toLowerCase()) {
        // 1 owner found by specific last name, redirect to details page
        return res.redirect(`/owners/${owners[0].id}`);
    }

    // Multiple owners found or generic search results
    res.render('owners/ownersList', {
      listOwners: owners,
      currentPage: currentPage,
      totalPages: totalPages,
      totalItems: totalItems,
    });
  } catch (error) {
    console.error('Error finding owners:', error);
    next(error);
  }
}

/**
 * @function initUpdateOwnerForm
 * @description Renders the form for updating an existing owner.
 * Mimics `@GetMapping("/owners/{ownerId}/edit")`.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
function initUpdateOwnerForm(req, res) {
  // `res.locals.owner` would be the fetched Owner object from `loadOwner` middleware.
  res.render(VIEWS_OWNER_CREATE_OR_UPDATE_FORM, { owner: res.locals.owner });
}

/**
 * @async @function processUpdateOwnerForm
 * @description Processes the form submission for updating an existing owner.
 * Mimics `@PostMapping("/owners/{ownerId}/edit")`.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function.
 */
async function processUpdateOwnerForm(req, res, next) {
  const ownerId = parseInt(req.params.ownerId, 10);
  const errors = validationResult(req);

  // Check for ID mismatch between path and form (if ID is implicitly in req.body, which it isn't usually in RESTful forms)
  // The original Java code explicitly checks owner.getId() against ownerId, which implies the form *could* carry its own ID.
  // In Express, req.body typically doesn't contain path params directly. We'll rely on `ownerId` from the path.
  // If a hidden 'id' field were present in the form (`req.body.id`), we'd compare `parseInt(req.body.id)` with `ownerId`.
  // For now, assuming `ownerId` from URL is the authoritative ID.

  if (!errors.isEmpty()) {
    // If there are validation errors, re-render the form with errors
    req.flash = { error: res.__('error', { context: 'updating the owner' }) };
    return res.render(VIEWS_OWNER_CREATE_OR_UPDATE_FORM, {
      owner: { ...req.body, id: ownerId, isNew: () => false }, // Re-populate form with submitted data
      errors: errors.array(),
      flash: req.flash
    });
  }

  try {
    await ownerService.updateOwner(ownerId, req.body);
    req.flash = { message: res.__('Owner Values Updated') };
    res.redirect(`/owners/${ownerId}`);
  } catch (error) {
    console.error(`Error updating owner ${ownerId}:`, error);
    req.flash = { error: res.__('error', { context: 'updating the owner' }) };
    return res.render(VIEWS_OWNER_CREATE_OR_UPDATE_FORM, {
      owner: { ...req.body, id: ownerId, isNew: () => false },
      flash: req.flash
    });
  }
}

/**
 * @function showOwner
 * @description Displays an owner's details, including their pets and visits.
 * Mimics `@GetMapping("/owners/{ownerId}")`.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function.
 */
function showOwner(req, res, next) {
  // `res.locals.owner` would be the fetched Owner object from `loadOwner` middleware.
  if (!res.locals.owner) {
    // This case should be handled by loadOwner, but as a fallback
    const err = new Error(res.__('notFound', { entity: 'Owner' }));
    err.status = 404;
    return next(err);
  }

  res.render('owners/ownerDetails', {
    owner: res.locals.owner,
    message: req.flash?.message, // Retrieve flash message
    error: req.flash?.error // Retrieve flash error
  });
}

module.exports = {
  loadOwner,
  initCreationForm,
  processCreationForm,
  initFindForm,
  processFindForm,
  initUpdateOwnerForm,
  processUpdateOwnerForm,
  showOwner
};
