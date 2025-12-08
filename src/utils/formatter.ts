/**
 * @module utils/formatter
 * @description Provides a utility class for formatting and parsing `PetType` objects.
 *              Mimics Spring's `PetTypeFormatter.java`.
 */

import { PetType } from '@models/owner/PetType';
import { petTypeRepository } from '@repositories/owner/PetTypeRepository';
import i18n from 'i18next';
import { HttpError } from './errors';

/**
 * @class PetTypeFormatter
 * @description Instructs how to parse and print elements of type 'PetType'.
 *              This is typically used when converting between string representations
 *              (e.g., from a form field) and `PetType` objects.
 */
export class PetTypeFormatter {
  private petTypeRepo = petTypeRepository;

  /**
   * @method print
   * @description Converts a `PetType` object into its string representation.
   * @param {PetType} petType - The `PetType` object to print.
   * @returns {string} The name of the pet type, or "<null>" if the name is not set.
   */
  print(petType: PetType): string {
    return petType.name || '<null>';
  }

  /**
   * @method parse
   * @description Parses a string representation and converts it into a `PetType` object.
   * @param {string} text - The string representation of the pet type (e.g., "dog").
   * @returns {Promise<PetType>} A promise that resolves to the matching `PetType` object.
   * @throws {HttpError} If the pet type is not found in the database.
   */
  async parse(text: string): Promise<PetType> {
    const petType = await this.petTypeRepo.findByName(text);
    if (petType) {
      return petType;
    }
    // Use i18n for error message
    throw new HttpError(400, i18n.t('type.notFound', { type: text }));
  }
}

export const petTypeFormatter = new PetTypeFormatter();
