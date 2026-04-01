/**
 * @file src/validators/visit.validator.js
 * @description Custom validation logic for Visit entities.
 * This ensures fields are not blank and dates are valid.
 * This directly translates some validation aspects of `Visit.java`
 * and implicit validation from Spring's `BindingResult`.
 */

const moment = require('moment'); // For date validation

/**
 * @function validate
 * @description Validates a Visit object based on business rules.
 * @param {object} visitData - The visit data to validate (from req.body).
 * @param {function} __ - The i18n translation function.
 * @returns {Array<object>} An array of validation error objects (each with `param`, `msg`, `value`).
 */
function validate(visitData, __) {
  const errors = [];

  // Description validation
  if (!visitData.description || visitData.description.trim().length === 0) {
    errors.push({ param: 'description', msg: __('required'), value: visitData.description });
  }

  // Date validation
  if (!visitData.date || visitData.date.trim().length === 0) {
    errors.push({ param: 'date', msg: __('required'), value: visitData.date });
  } else {
    const parsedDate = moment(visitData.date, 'YYYY-MM-DD', true); // Strict parsing
    if (!parsedDate.isValid()) {
      errors.push({ param: 'date', msg: __('typeMismatch.date'), value: visitData.date });
    }
  }

  return errors;
}

module.exports = {
  validate
};
