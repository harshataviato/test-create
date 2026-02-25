/**
 * @fileoverview Common validation middleware for Owner and Visit objects.
 * This module defines reusable validation rules using `express-validator`.
 */

const { body } = require('express-validator'); // Import body from express-validator

/**
 * Validation rules for Owner creation and update forms.
 * @returns {Array<Function>} An array of express-validator validation chains.
 */
exports.validateOwnerForm = () => {
    return [
        body('firstName')
            .trim()
            .notEmpty().withMessage((value, { req }) => req.__('firstName') + ' ' + req.__('required')) // First name is required
            .isLength({ max: 30 }).withMessage((value, { req }) => req.__('firstName') + ' ' + req.__('too long')), // Max length
        body('lastName')
            .trim()
            .notEmpty().withMessage((value, { req }) => req.__('lastName') + ' ' + req.__('required')) // Last name is required
            .isLength({ max: 30 }).withMessage((value, { req }) => req.__('lastName') + ' ' + req.__('too long')), // Max length
        body('address')
            .trim()
            .notEmpty().withMessage((value, { req }) => req.__('address') + ' ' + req.__('required')) // Address is required
            .isLength({ max: 255 }).withMessage((value, { req }) => req.__('address') + ' ' + req.__('too long')), // Max length
        body('city')
            .trim()
            .notEmpty().withMessage((value, { req }) => req.__('city') + ' ' + req.__('required')) // City is required
            .isLength({ max: 80 }).withMessage((value, { req }) => req.__('city') + ' ' + req.__('too long')), // Max length
        body('telephone')
            .trim()
            .notEmpty().withMessage((value, { req }) => req.__('telephone') + ' ' + req.__('required')) // Telephone is required
            .isLength({ min: 10, max: 10 }).withMessage((value, { req }) => req.__('telephone.invalid')) // Must be 10 digits
            .isNumeric().withMessage((value, { req }) => req.__('telephone.invalid')) // Must be numeric
    ];
};

/**
 * Validation rules for Visit creation and update forms.
 * @returns {Array<Function>} An array of express-validator validation chains.
 */
exports.validateVisitForm = () => {
    return [
        body('date') // Note: form field is 'date', model is 'visitDate'
            .notEmpty().withMessage((value, { req }) => req.__('date') + ' ' + req.__('required')) // Visit date is required
            .isISO8601().toDate().withMessage((value, { req }) => req.__('typeMismatch.date')), // Must be a valid date format
        body('description')
            .trim()
            .notEmpty().withMessage((value, { req }) => req.__('description') + ' ' + req.__('required')) // Description is required
            .isLength({ max: 255 }).withMessage((value, { req }) => req.__('description') + ' ' + req.__('too long')) // Max length
    ];
};
