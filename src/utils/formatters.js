/**
 * @file utils/formatters.js
 * @description Utility functions for formatting and parsing data.
 * Mimics Spring's `Formatter` and `PropertyEditor` concepts, specifically `PetTypeFormatter.java`.
 * In Node.js/Express, this logic is usually handled within middleware or services.
 */

const petTypeService = require('../services/petTypeService');

/**
 * @class PetTypeFormatter
 * @description Provides methods to convert PetType objects to strings and vice-versa.
 * This class is designed to be used in validation or data processing,
 * not directly as an Express middleware.
 */
class PetTypeFormatter {

  /**
   * @static
   * @method print
   * @description Converts a PetType object to its string representation (its name).
   * @param {object} petType - The PetType object.
   * @returns {string} The name of the pet type, or '<null>' if not available.
   */
  static print(petType) {
    const name = petType ? petType.name : null;
    return name !== null ? name : '<null>';
  }

  /**
   * @static
   * @async
   * @method parse
   * @description Converts a string (pet type name) to a PetType object.
   * Fetches the PetType from the database.
   * @param {string} text - The string representation of the pet type name.
   * @returns {Promise<object>} A promise that resolves to the PetType object.
   * @throws {Error} If no pet type is found for the given text.
   */
  static async parse(text) {
    if (!text) {
      throw new Error('Pet type name cannot be empty.');
    }
    const petType = await petTypeService.findPetTypeByName(text);
    if (!petType) {
      throw new Error(`Type not found: ${text}`);
    }
    return petType;
  }
}

module.exports = PetTypeFormatter;
