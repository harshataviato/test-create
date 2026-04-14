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
const ownerValidationRules = (req, res) => {
  return [
    body('firstName')
      .trim()
      .notEmpty().withMessage(res.__('firstName') + ' ' + res.__('required')),
    body('lastName')
      .trim()
      .notEmpty().withMessage(res.__('lastName') + ' ' + res.__('required')),
    body('address')
      .trim()
      .notEmpty().withMessage(res.__('address') + ' ' + res.__('required')),
    body('city')
      .trim()
      .notEmpty().withMessage(res.__('city') + ' ' + res.__('required')),
    body('telephone')
      .trim()
      .notEmpty().withMessage(res.__('telephone') + ' ' + res.__('required'))
      .matches(/^\d{10}$/).withMessage(res.__('telephone.invalid')),
  ];
};

/**
 * Validation rules for Pet creation and update forms.
 * Mirrors the validation logic from Java's `PetValidator.java`.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Array<import('express-validator').ValidationChain>} Array of validation chains.
 */
const petValidationRules = (req, res) => {
  const isNew = !req.params.petId; // Determine if it's a new pet based on URL parameter
  const owner = req.locals.owner; // Owner object loaded by previous middleware

  return [
    body('name')
      .trim()
      .notEmpty().withMessage(res.__('name') + ' ' + res.__('required'))
      .custom((value, { req }) => {
        // Custom validation for duplicate pet name for the same owner
        if (isNew && owner && owner.getPets().some(p => p.name.toLowerCase() === value.toLowerCase())) {
          throw new Error(res.__('duplicate')); // Pet name already exists for this owner
        }
        return true;
      }),
    body('birthDate')
      .trim()
      .notEmpty().withMessage(res.__('birthDate') + ' ' + res.__('required'))
      .isISO8601().toDate().withMessage(res.__('typeMismatch.date')) // Validate date format
      .custom((value, { req }) => {
        // Custom validation: birth date cannot be in the future
        if (value && new Date(value) > new Date()) {
          throw new Error(res.__('typeMismatch.birthDate')); // Birth date is in the future
        }
        return true;
      }),
    body('type')
      .trim()
      .notEmpty().withMessage(res.__('type') + ' ' + res.__('required')),
  ];
};

/**
 * Validation rules for Visit creation and update forms.
 * Mirrors the validation constraints from Java's `Visit.java`.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Array<import('express-validator').ValidationChain>} Array of validation chains.
 */
const visitValidationRules = (req, res) => {
  return [
    body('date')
      .trim()
      .notEmpty().withMessage(res.__('date') + ' ' + res.__('required'))
      .isISO8601().toDate().withMessage(res.__('typeMismatch.date')), // Validate date format
    body('description')
      .trim()
      .notEmpty().withMessage(res.__('description') + ' ' + res.__('required'))
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
  req.flash('error', res.__('error.general')); // Add a general error flash message

  // Re-populate form fields to preserve user input
  // Note: For complex objects (like 'owner' or 'pet'), direct assignment might not cover nested fields.
  // The 'owner' and 'pet' objects should ideally be constructed from req.body and passed to the view.
  if (req.body) {
    if (viewName.includes('owner')) {
      res.locals.owner = { ...req.locals.owner, ...req.body, id: req.params.ownerId ? parseInt(req.params.ownerId) : null };
    } else if (viewName.includes('pet')) {
      res.locals.pet = { ...req.locals.pet, ...req.body, id: req.params.petId ? parseInt(req.params.petId) : null };
    } else if (viewName.includes('visit')) {
      res.locals.visit = { ...req.locals.visit, ...req.body, id: req.params.visitId ? parseInt(req.params.visitId) : null };
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
