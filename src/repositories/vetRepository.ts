/**
 * @module repositories/vetRepository
 * @description Provides data access operations for the Vet entity using an in-memory store.
 * This repository mimics the functionality of Spring Data JPA repositories for Vet.
 */

import data from '@repositories/inMemoryData';
import { Vet } from '@models/vet';

/**
 * @class VetRepository
 * @description Manages read-only operations and pagination for Vet entities
 * within the in-memory data store.
 */
export class VetRepository {

  /**
   * @method findAll
   * @description Retrieves all Vet entities from the data store.
   * Specialties within each vet are sorted by name.
   * @returns {Vet[]} An array of all Vet entities.
   */
  findAll(): Vet[] {
    // Return a deep copy to prevent direct modification of the stored object
    // And ensure specialties are sorted
    return data.vets.map(vet => {
      const clonedVet = JSON.parse(JSON.stringify(vet)) as Vet;
      clonedVet.specialties.sort((a, b) => a.name.localeCompare(b.name));
      return clonedVet;
    });
  }

  /**
   * @method findAllPaginated
   * @description Retrieves a paginated list of Vet entities from the data store.
   * @param {number} page - The current page number (1-based index).
   * @param {number} pageSize - The number of items per page.
   * @returns {Vet[]} A paginated array of Vet entities.
   */
  findAllPaginated(page: number, pageSize: number): Vet[] {
    // Sort vets by last name then first name for consistent pagination
    const sortedVets = [...data.vets].sort((a, b) => {
      const lastNameCompare = a.lastName.localeCompare(b.lastName);
      if (lastNameCompare !== 0) {
        return lastNameCompare;
      }
      return a.firstName.localeCompare(b.firstName);
    });

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedVets.slice(startIndex, endIndex).map(vet => {
      const clonedVet = JSON.parse(JSON.stringify(vet)) as Vet;
      clonedVet.specialties.sort((a, b) => a.name.localeCompare(b.name));
      return clonedVet;
    });
  }

  /**
   * @method countAllVets
   * @description Returns the total number of veterinarians in the data store.
   * @returns {number} The total count of Vet entities.
   */
  countAllVets(): number {
    return data.vets.length;
  }
}
