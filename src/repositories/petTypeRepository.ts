/**
 * @module repositories/petTypeRepository
 * @description Provides data access operations for the PetType entity using an in-memory store.
 * This repository mimics the functionality of Spring Data JPA repositories for PetType.
 */

import data from '@repositories/inMemoryData';
import { PetType } from '@models/petType';

/**
 * @class PetTypeRepository
 * @description Manages read-only operations for PetType entities within the in-memory data store.
 */
export class PetTypeRepository {

  /**
   * @method findPetTypes
   * @description Retrieves all PetType entities from the data store, ordered by name.
   * @returns {PetType[]} A sorted array of all PetType entities.
   */
  findPetTypes(): PetType[] {
    // Return a deep copy and sort by name
    return [...data.petTypes].sort((a, b) => a.name.localeCompare(b.name)).map(type => JSON.parse(JSON.stringify(type)) as PetType);
  }

  /**
   * @method findByName
   * @description Retrieves a PetType entity by its name.
   * @param {string} name - The name of the pet type to retrieve.
   * @returns {PetType | undefined} The found PetType entity, or `undefined` if not found.
   */
  findByName(name: string): PetType | undefined {
    return data.petTypes.find(type => type.name === name);
  }
}
