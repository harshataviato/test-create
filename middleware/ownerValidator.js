/**
 * @module middleware/ownerValidator
 * @description Custom validation rules for Owner creation and updates using express-validator.
 */

const { body } = require('express-validator');

/**
 * @function validateOwner
 * @description Defines validation rules for owner data.
 * Checks for required fields and valid telephone format.
 * @returns {Array<Function>} An array of express-validator middleware functions.
 */
const validateOwner = () => {
  return [
    body('firstName')
      .trim()
      .notEmpty().withMessage((value, { req }) => req.__('validation.required', { field: req.__('common.firstName') }))
      .isLength({ min: 2, max: 50 }).withMessage((value, { req }) => req.__('validation.minLength', { field: req.__('common.firstName'), min: 2 }) + ' ' + req.__('validation.maxLength', { field: req.__('common.firstName'), max: 50 })),
    body('lastName')
      .trim()
      .notEmpty().withMessage((value, { req }) => req.__('validation.required', { field: req.__('common.lastName') }))
      .isLength({ min: 2, max: 50 }).withMessage((value, { req }) => req.__('validation.minLength', { field: req.__('common.lastName'), min: 2 }) + ' ' + req.__('validation.maxLength', { field: req.__('common.lastName'), max: 50 })),
    body('address')
      .trim()
      .notEmpty().withMessage((value, { req }) => req.__('validation.required', { field: req.__('common.address') }))
      .isLength({ min: 5, max: 100 }).withMessage((value, { req }) => req.__('validation.minLength', { field: req.__('common.address'), min: 5 }) + ' ' + req.__('validation.maxLength', { field: req.__('common.address'), max: 100 })),
    body('city')
      .trim()
      .notEmpty().withMessage((value, { req }) => req.__('validation.required', { field: req.__('common.city') }))
      .isLength({ min: 2, max: 50 }).withMessage((value, { req }) => req.__('validation.minLength', { field: req.__('common.city'), min: 2 }) + ' ' + req.__('validation.maxLength', { field: req.__('common.city'), max: 50 })),
    body('telephone')
      .trim()
      .notEmpty().withMessage((value, { req }) => req.__('validation.required', { field: req.__('common.telephone') }))
      .isLength({ min: 10, max: 10 }).withMessage((value, { req }) => req.__('validation.invalidPhone', { field: req.__('common.telephone') }))
      .matches(/^\d{10}$/).withMessage((value, { req }) => req.__('validation.invalidPhone', { field: req.__('common.telephone') })),
  ];
};

module.exports = {
  validateOwner
};
