/**
 * @module services/pet-type.formatter
 * @description
 * Provides utility functions for formatting and parsing `PetType` objects.
 * This is analogous to Spring's `Formatter` interface for data binding.
 */

import { PetType } from '../models/owner/pet-type.entity';
import { PetTypeRepository } from '../repositories/pet-type.repository';

/**
 * `PetTypeFormatter` class provides methods to convert `PetType` objects to strings
 * and strings back to `PetType` objects. It is used for handling `PetType` in forms.
 */
export class PetTypeFormatter {
  /**
   * Converts a `PetType` object into its string representation (its name).
   *
   * @param {PetType} petType - The `PetType` object to format.
   * @returns {string} The name of the pet type, or '<null>' if the name is not set.
   */
  print(petType: PetType): string {
    return petType.name ?? '<null>';
  }

  /**
   * Parses a string representation into a `PetType` object.
   * It searches the database for a `PetType` with a matching name.
   *
   * @param {string} text - The string to parse, expected to be a pet type name.
   * @returns {Promise<PetType>} A promise that resolves to the found `PetType` object.
   * @throws {Error} If no `PetType` with the given name is found.
   */
  async parse(text: string): Promise<PetType> {
    const findPetTypes = await PetTypeRepository.findPetTypes();
    const foundType = findPetTypes.find(type => type.name === text);

    if (foundType) {
      return foundType;
    }
    throw new Error(`type not found: ${text}`); // Mimics ParseException
  }
}

// Export an instance of the formatter for easy use
export const petTypeFormatter = new PetTypeFormatter();
