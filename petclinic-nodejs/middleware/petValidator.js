/**
 * @fileoverview Validation middleware for Pet objects.
 * This module defines validation rules for pet properties using `express-validator`.
 * It includes checks for name, birth date, and type.
 */

const { body } = require('express-validator'); // Import body from express-validator
const { PetType } = require('../models'); // Import PetType model for custom validation

/**
 * Custom validator to check if a pet type exists in the database.
 * @param {number|string} value - The ID or name of the pet type.
 * @returns {Promise<boolean>} A promise that resolves to true if the pet type exists.
 * @throws {Error} If the pet type does not exist.
 */
const petTypeExists = async (value, { req }) => {
    if (!value) {
        // If type is not provided, it's handled by `notEmpty()` validation.
        return true;
    }
    const petType = await PetType.findByPk(value); // Assuming value is an ID
    if (!petType) {
        // Use i18n for error messages
        throw new Error(req.__('type') + ' ' + req.__('notFound'));
    }
    return true;
};

/**
 * Custom validator to check if birth date is not in the future.
 * @param {string} value - The birth date string.
 * @returns {boolean} True if the birth date is not in the future.
 * @throws {Error} If the birth date is in the future.
 */
const isNotInFuture = (value, { req }) => {
    if (!value) {
        // If birthDate is not provided, it's handled by `notEmpty()` validation.
        return true;
    }
    const birthDate = new Date(value);
    const currentDate = new Date();
    if (birthDate > currentDate) {
        // Use i18n for error messages
        throw new Error(req.__('typeMismatch.birthDate'));
    }
    return true;
};

/**
 * Validation rules for Pet creation and update forms.
 * @returns {Array<Function>} An array of express-validator validation chains.
 */
exports.validatePetForm = () => {
    return [
        body('name')
            .trim()
            .notEmpty().withMessage((value, { req }) => req.__('name') + ' ' + req.__('required')) // Pet name is required
            .isLength({ max: 30 }).withMessage((value, { req }) => req.__('name') + ' ' + req.__('too long')), // Max length for name
        body('birthDate')
            .notEmpty().withMessage((value, { req }) => req.__('birthDate') + ' ' + req.__('required')) // Birth date is required
            .isISO8601().toDate().withMessage((value, { req }) => req.__('typeMismatch.birthDate')) // Must be a valid date format
            .custom(isNotInFuture), // Custom check for future dates
        body('type')
            .notEmpty().withMessage((value, { req }) => req.__('type') + ' ' + req.__('required')) // Pet type is required
            .custom(petTypeExists) // Custom check if the pet type exists
    ];
};
