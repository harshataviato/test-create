/**
 * @file src/validators/owner.validator.js
 * @description Validation rules for Owner entities.
 * This replaces JSR-303 annotations (`@NotBlank`, `@Pattern`) in `Owner.java`.
 * Uses `express-validator` for request data validation.
 */

const { body } = require('express-validator');

/**
 * @constant {Array<Function>} ownerValidationRules
 * @description An array of validation middleware functions for Owner data.
 * Each function applies a specific validation rule.
 */
const ownerValidationRules = [
  // Validate firstName: must not be empty
  body('firstName')
    .trim()
    .notEmpty().withMessage((value, { req }) => req.__('required')),

  // Validate lastName: must not be empty
  body('lastName')
    .trim()
    .notEmpty().withMessage((value, { req }) => req.__('required')),

  // Validate address: must not be empty
  body('address')
    .trim()
    .notEmpty().withMessage((value, { req }) => req.__('required')),

  // Validate city: must not be empty
  body('city')
    .trim()
    .notEmpty().withMessage((value, { req }) => req.__('required')),

  // Validate telephone: must not be empty and must be a 10-digit number
  body('telephone')
    .trim()
    .notEmpty().withMessage((value, { req }) => req.__('required'))
    .isLength({ min: 10, max: 10 }).withMessage((value, { req }) => req.__('telephone.invalid')) // Ensure exactly 10 digits
    .isNumeric().withMessage((value, { req }) => req.__('telephone.invalid')), // Ensure all characters are numeric
];

module.exports = ownerValidationRules;
