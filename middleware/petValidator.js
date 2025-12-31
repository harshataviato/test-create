/**
 * @module middleware/petValidator
 * @description Custom validation rules for Pet creation and updates using express-validator.
 */

const { body } = require('express-validator');
const db = require('../config/database');
const moment = require('moment');

/**
 * @function validatePet
 * @description Defines validation rules for pet data.
 * Checks for required fields, date format, future dates, and valid pet type.
 * @returns {Array<Function>} An array of express-validator middleware functions.
 */
const validatePet = () => {
  return [
    body('name')
      .trim()
      .notEmpty().withMessage((value, { req }) => req.__('validation.required', { field: req.__('common.name') }))
      .isLength({ min: 2, max: 50 }).withMessage((value, { req }) => req.__('validation.minLength', { field: req.__('common.name'), min: 2 }) + ' ' + req.__('validation.maxLength', { field: req.__('common.name'), max: 50 })),
    body('birthDate')
      .notEmpty().withMessage((value, { req }) => req.__('validation.required', { field: req.__('common.birthDate') }))
      .isISO8601().withMessage((value, { req }) => req.__('validation.invalidDate', { field: req.__('common.birthDate') }))
      .custom((value, { req }) => {
        if (moment(value).isAfter(moment(), 'day')) {
          throw new Error(req.__('validation.futureDate', { field: req.__('common.birthDate') }));
        }
        return true;
      }),
    body('typeId')
      .notEmpty().withMessage((value, { req }) => req.__('validation.required', { field: req.__('common.type') }))
      .isInt().withMessage((value, { req }) => req.__('validation.invalidPetType'))
      .custom(async (value, { req }) => {
        const petType = await db.PetType.findByPk(value);
        if (!petType) {
          throw new Error(req.__('validation.invalidPetType'));
        }
        return true;
      }),
  ];
};

module.exports = {
  validatePet
};
