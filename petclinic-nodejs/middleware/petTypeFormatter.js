/**
 * @fileoverview Middleware to "format" PetType objects.
 * In a Spring context, formatters convert between string representations and objects.
 * In Node.js (specifically for EJS forms), this is handled differently:
 * - When rendering a select field, you pass a list of objects (PetType.findAll()).
 * - When processing a form, the selected value (PetType ID) comes as a string in req.body.
 *   This value needs to be converted back to a PetType object (or just its ID is stored in DB).
 * This module exports utility functions to assist with these conversions if needed,
 * but direct use in controllers is often more explicit.
 */

const { PetType } = require('../models'); // Import the PetType model

/**
 * Converts a PetType object to its string representation (its name).
 * This function mimics the `print` method of Spring's Formatter.
 * @param {object} petType - The PetType object to convert.
 * @returns {string} The name of the pet type, or "<null>" if name is not available.
 */
exports.printPetType = (petType) => {
    return petType && petType.name ? petType.name : '<null>';
};

/**
 * Converts a string (pet type name or ID) to a PetType object.
 * This function mimics the `parse` method of Spring's Formatter.
 * It's primarily used when a string value from a form needs to be resolved into a full object.
 * @param {string|number} text - The string or ID representation of the pet type.
 * @returns {Promise<object|null>} A promise that resolves to the PetType object if found, otherwise null.
 * @throws {Error} If the pet type is not found for the given text.
 */
exports.parsePetType = async (text, req) => {
    // Attempt to parse by ID first (if text is numeric)
    if (!isNaN(text) && text !== '') {
        const petType = await PetType.findByPk(parseInt(text));
        if (petType) return petType;
    }

    // If not found by ID or not numeric, attempt to parse by name
    const petType = await PetType.findOne({ where: { name: text } });
    if (petType) {
        return petType;
    } else {
        // Throw an error if pet type is not found, similar to Spring's ParseException
        throw new Error(req.__('type not found: ') + text);
    }
};

/**
 * Middleware to load all pet types and make them available to views.
 * This is useful for `<select>` dropdowns.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function.
 */
exports.loadPetTypesMiddleware = async (req, res, next) => {
    try {
        const petTypes = await PetType.findAll({ order: [['name', 'ASC']] });
        // Make `petTypes` available as a local variable for all views
        // This simulates @ModelAttribute("types") in Spring
        res.locals.types = petTypes;
        next();
    } catch (error) {
        console.error('Error loading pet types:', error);
        next(error); // Pass error to the error handling middleware
    }
};
