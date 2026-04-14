/**
 * @file Validation middleware for owner and pet forms.
 * @description Provides validation rules and error handling for form submissions,
 * similar to Spring's `BindingResult` and `Validator` interfaces.
 * Uses `express-validator` for defining and applying validation rules.
 * @author Google Senior Engineer
 */

const { body, validationResult } = require('express-validator');

/**
 * Validation rules for Owner creation and update forms.
 * Mirrors the validation constraints from Java's `Owner.java` and `Person.java`.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Array<import('express-validator').ValidationChain>} Array of validation chains.
 */
const ownerValidationRules = () => {
  return [
    body('firstName')
      .trim()
      .notEmpty().withMessage((value, { req }) => req.__('firstName') + ' ' + req.__('required')),
    body('lastName')
      .trim()
      .notEmpty().withMessage((value, { req }) => req.__('lastName') + ' ' + req.__('required')),
    body('address')
      .trim()
      .notEmpty().withMessage((value, { req }) => req.__('address') + ' ' + req.__('required')),
    body('city')
      .trim()
      .notEmpty().withMessage((value, { req }) => req.__('city') + ' ' + req.__('required')),
    body('telephone')
      .trim()
      .notEmpty().withMessage((value, { req }) => req.__('telephone') + ' ' + req.__('required'))
      .matches(/^\d{10}$/).withMessage((value, { req }) => req.__('telephone.invalid')),
  ];
};

/**
 * Validation rules for Pet creation and update forms.
 * Mirrors the validation logic from Java's `PetValidator.java`.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Array<import('express-validator').ValidationChain>} Array of validation chains.
 */
const petValidationRules = () => {
  return [
    body('name')
      .trim()
      .notEmpty().withMessage((value, { req }) => req.__('name') + ' ' + req.__('required'))
      .custom((value, { req }) => {
        const owner = req.locals.owner;
        const isNew = !req.params.petId; // Determine if it's a new pet based on URL parameter
        // Custom validation for duplicate pet name for the same owner
        if (owner && owner.getPets().some(p => p.name.toLowerCase() === value.toLowerCase() && (isNew || p.id !== parseInt(req.params.petId)))) {
          throw new Error(req.__('duplicate')); // Pet name already exists for this owner
        }
        return true;
      }),
    body('birthDate')
      .trim()
      .notEmpty().withMessage((value, { req }) => req.__('birthDate') + ' ' + req.__('required'))
      .isISO8601().toDate().withMessage((value, { req }) => req.__('typeMismatch.date')) // Validate date format
      .custom((value, { req }) => {
        // Custom validation: birth date cannot be in the future
        if (value && new Date(value) > new Date()) {
          throw new Error(req.__('typeMismatch.birthDate')); // Birth date is in the future
        }
        return true;
      }),
    body('type')
      .trim()
      .notEmpty().withMessage((value, { req }) => req.__('type') + ' ' + req.__('required')),
  ];
};

/**
 * Validation rules for Visit creation and update forms.
 * Mirrors the validation constraints from Java's `Visit.java`.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Array<import('express-validator').ValidationChain>} Array of validation chains.
 */
const visitValidationRules = () => {
  return [
    body('date')
      .trim()
      .notEmpty().withMessage((value, { req }) => req.__('date') + ' ' + req.__('required'))
      .isISO8601().toDate().withMessage((value, { req }) => req.__('typeMismatch.date')), // Validate date format
    body('description')
      .trim()
      .notEmpty().withMessage((value, { req }) => req.__('description') + ' ' + req.__('required'))
  ];
};


/**
 * Middleware to process validation results.
 * If there are validation errors, it adds them to `res.locals.errors` and `req.flash('error')`
 * and then renders the specified view, preventing the route handler from executing.
 * @param {string} viewName - The EJS view to render if validation fails.
 * @returns {import('express').RequestHandler} Express middleware function.
 */
const validate = (viewName) => (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next(); // No validation errors, proceed to the next middleware/route handler
  }

  // Map validation errors for display in the view
  const formattedErrors = errors.array().reduce((acc, err) => {
    if (!acc[err.path]) {
      acc[err.path] = [];
    }
    acc[err.path].push(err.msg);
    return acc;
  }, {});

  res.locals.errors = formattedErrors; // Make errors available in the view
  req.flash('error', req.__('error.general')); // Add a general error flash message

  // Re-populate form fields to preserve user input
  // Note: For complex objects (like 'owner' or 'pet'), direct assignment might not cover nested fields.
  // The 'owner' and 'pet' objects should ideally be constructed from req.body and passed to the view.
  if (req.body) {
    if (viewName.includes('owner')) {
      const Owner = require('../models/owner');
      res.locals.owner = new Owner({ ...req.locals.owner, ...req.body, id: req.params.ownerId ? parseInt(req.params.ownerId) : null });
    } else if (viewName.includes('pet')) {
      const Pet = require('../models/pet');
      // Special handling for pet type which is an object
      const petTypeFromReq = res.locals.types.find(type => type.name === req.body.type);
      res.locals.pet = new Pet({ ...req.locals.pet, ...req.body, id: req.params.petId ? parseInt(req.params.petId) : null, type: petTypeFromReq });
    } else if (viewName.includes('visit')) {
      const Visit = require('../models/visit');
      res.locals.visit = new Visit({ ...req.locals.visit, ...req.body, id: req.params.visitId ? parseInt(req.params.visitId) : null });
    }
  }


  // Render the form view again with errors and previous input
  res.status(400).render(viewName, res.locals);
};

module.exports = {
  ownerValidationRules,
  petValidationRules,
  visitValidationRules,
  validate
};

