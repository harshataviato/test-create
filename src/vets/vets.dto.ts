import { Vet } from './entities/vet.entity';

/**
 * @module Vets
 * @description
 * Data Transfer Object (DTO) to encapsulate a list of `Vet` entities.
 * This DTO is primarily used for API responses that return a collection of vets,
 * allowing for easier serialization (e.g., to JSON or XML, though primarily JSON in NestJS).
 * It's analogous to Spring's `Vets` wrapper class.
 */
export class VetsDto {
  /**
   * An array of `Vet` entities.
   * If not initialized, it will be an empty array.
   */
  vets: Vet[] = [];

  /**
   * Returns the list of veterinarians.
   * This getter is provided for consistency with the original Java `Vets` class,
   * though direct access to `vets` property is also common in TypeScript.
   *
   * @returns {Vet[]} The list of vets.
   */
  getVetList(): Vet[] {
    return this.vets;
  }

  /**
   * Sets the list of veterinarians.
   * @param {Vet[]} vets - The array of `Vet` entities to set.
   */
  setVetList(vets: Vet[]): void {
    this.vets = vets;
  }
}
