/**
 * @module models/vet/Vets
 * @description A wrapper class for a list of veterinarians, primarily used for
 *              API responses where a root element is desired.
 *              Mimics Spring's `Vets.java`.
 */

import { Vet } from './Vet';
import { Type } from 'class-transformer';

/**
 * @class Vets
 * @description Simple domain object representing a list of veterinarians.
 *              Mostly here to be used for API responses (e.g., JSON/XML marshalling).
 */
export class Vets {
  /**
   * @property {Vet[]} vets
   * @description The list of veterinarian objects.
   * @decorator `@Type(() => Vet)` - Ensures proper transformation of array elements.
   */
  @Type(() => Vet)
  private vets: Vet[];

  constructor(vets: Vet[] = []) {
    this.vets = vets;
  }

  /**
   * @method getVetList
   * @description Returns the list of vets. Initializes an empty array if not already set.
   * @returns {Vet[]} The list of veterinarians.
   */
  getVetList(): Vet[] {
    if (this.vets === null || this.vets === undefined) {
      this.vets = [];
    }
    return this.vets;
  }

  /**
   * @method setVetList
   * @description Sets the list of vets.
   * @param {Vet[]} vets - The new list of veterinarians.
   */
  setVetList(vets: Vet[]): void {
    this.vets = vets;
  }
}
