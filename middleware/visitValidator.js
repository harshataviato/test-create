/**
 * @module middleware/visitValidator
 * @description Custom validation rules for Visit creation and updates using express-validator.
 */

const { body } = require('express-validator');
const moment = require('moment');

/**
 * @function validateVisit
 * @description Defines validation rules for visit data.
 * Checks for required fields, date format, and future dates.
 * @returns {Array<Function>} An array of express-validator middleware functions.
 */
const validateVisit = () => {
  return [
    body('visitDate')
      .notEmpty().withMessage((value, { req }) => req.__('validation.required', { field: req.__('common.visitDate') }))
      .isISO8601().withMessage((value, { req }) => req.__('validation.invalidDate', { field: req.__('common.visitDate') }))
      .custom((value, { req }) => {
        if (moment(value).isAfter(moment(), 'day')) {
          throw new Error(req.__('validation.futureDate', { field: req.__('common.visitDate') }));
        }
        return true;
      }),
    body('description')
      .trim()
      .notEmpty().withMessage((value, { req }) => req.__('validation.required', { field: req.__('common.description') }))
      .isLength({ min: 3, max: 255 }).withMessage((value, { req }) => req.__('validation.minLength', { field: req.__('common.description'), min: 3 }) + ' ' + req.__('validation.maxLength', { field: req.__('common.description'), max: 255 })),
  ];
};

module.exports = {
  validateVisit
};
