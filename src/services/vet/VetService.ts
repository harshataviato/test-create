/**
 * @module services/vet/VetService
 * @description Provides business logic for managing `Vet` entities.
 *              Interacts with the `VetRepository` for data access.
 */

import { vetRepository } from '@repositories/vet/VetRepository';
import { Vet } from '@models/vet/Vet';
import { Vets } from '@models/vet/Vets'; // Use the Vets wrapper class for consistent API
import i18n from 'i18next';

/**
 * @class VetService
 * @description Encapsulates business logic related to Vet entities.
 */
export class VetService {
  /**
   * @private {typeof vetRepository} vetRepo
   * @description Instance of VetRepository for database operations.
   */
  private vetRepo = vetRepository;

  /**
   * @method findAllVets
   * @description Retrieves all veterinarians.
   * @returns {Promise<Vets>} A `Vets` wrapper object containing a collection of `Vet`s.
   */
  async findAllVets(): Promise<Vets> {
    const vetsList = await this.vetRepo.findAllVets();
    return new Vets(vetsList);
  }

  /**
   * @method findVetsPaginated
   * @description Retrieves veterinarians with pagination.
   * @param {number} page - The current page number (1-indexed).
   * @param {number} pageSize - The number of items per page.
   * @returns {Promise<{ vets: Vets, totalCount: number, totalPages: number }>} An object containing
   *          a `Vets` wrapper, total count, and total pages for the given pagination.
   */
  async findVetsPaginated(page: number, pageSize: number): Promise<{ vets: Vets; totalCount: number; totalPages: number }> {
    const { vets, totalCount, totalPages } = await this.vetRepo.findAllVetsPaginated(page, pageSize);
    return {
      vets: new Vets(vets),
      totalCount,
      totalPages,
    };
  }
}

export const vetService = new VetService();
