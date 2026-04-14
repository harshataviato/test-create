/**
 * @file utils/validators.js
 * @description Centralized validation rules using `express-validator`.
 * Mimics Spring's `@Valid` annotations and `PetValidator.java`.
 */

const { body, body, check, validationResult } = require('express-validator');
const moment = require('moment'); // For date validation

/**
 * @function validateOwner
 * @description Validation middleware for Owner creation/update forms.
 * Checks for non-blank fields and valid telephone format.
 * Mimics `@NotBlank` and `@Pattern` annotations from Java.
 * @returns {Array<Function>} An array of Express validation middleware.
 */
exports.validateOwner = () => {
  return [
    body('firstName')
      .trim()
      .notEmpty().withMessage('required'), // i18n key
    body('lastName')
      .trim()
      .notEmpty().withMessage('required'),
    body('address')
      .trim()
      .notEmpty().withMessage('required'),
    body('city')
      .trim()
      .notEmpty().withMessage('required'),
    body('telephone')
      .trim()
      .notEmpty().withMessage('required')
      .matches(/^\d{10}$/).withMessage('telephone.invalid'), // i18n key
  ];
};

/**
 * @function validatePet
 * @description Validation middleware for Pet creation/update forms.
 * Checks for non-blank name, presence of type, and valid birth date format.
 * Mimics `PetValidator.java`.
 * @returns {Array<Function>} An array of Express validation middleware.
 */
exports.validatePet = () => {
  return [
    body('name')
      .trim()
      .notEmpty().withMessage('required'),
    body('type')
      .trim()
      .notEmpty().withMessage('required') // Checks if type is selected
      .custom(async (value) => {
        // Custom validation to ensure the pet type actually exists
        const PetTypeService = require('../services/petTypeService'); // Lazy load to avoid circular dependency
        const petType = await PetTypeService.findPetTypeByName(value);
        if (!petType) {
          throw new Error('typeMismatch.petType'); // Custom error message for pet type not found
        }
        return true;
      }),
    body('birthDate')
      .notEmpty().withMessage('required')
      .isDate().withMessage('typeMismatch.date') // Basic date format check
      .custom((value) => {
        if (!moment(value, 'YYYY-MM-DD').isValid()) {
          throw new Error('typeMismatch.date'); // Specific message for invalid format
        }
        return true;
      }),
  ];
};

/**
 * @function validateVisit
 * @description Validation middleware for Visit creation forms.
 * Checks for non-blank description and valid date format.
 * Mimics `@NotBlank` and `@DateTimeFormat` validation.
 * @returns {Array<Function>} An array of Express validation middleware.
 */
exports.validateVisit = () => {
  return [
    body('description')
      .trim()
      .notEmpty().withMessage('required'),
    body('date') // Renamed from visitDate to 'date' for consistency with input field name
      .notEmpty().withMessage('required')
      .isDate().withMessage('typeMismatch.date') // Basic date format check
      .custom((value) => {
        if (!moment(value, 'YYYY-MM-DD').isValid()) {
          throw new Error('typeMismatch.date'); // Specific message for invalid format
        }
        return true;
      }),
  ];
};
