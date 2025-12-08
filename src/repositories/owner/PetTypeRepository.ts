/**
 * @module repositories/owner/PetTypeRepository
 * @description Custom TypeORM repository for the `PetType` entity,
 *              providing specialized data access methods.
 *              Mimics Spring's `PetTypeRepository.java`.
 */

import { Repository } from 'typeorm';
import { AppDataSource } from '@config/database';
import { PetType } from '@models/owner/PetType';

/**
 * @class PetTypeRepository
 * @extends {Repository<PetType>}
 * @description Repository class for `PetType` domain objects, extending TypeORM's base Repository.
 */
export class PetTypeRepository extends Repository<PetType> {
  constructor() {
    super(PetType, AppDataSource.createEntityManager());
  }

  /**
   * @method findPetTypes
   * @description Retrieves all `PetType`s from the data store, ordered by name.
   * @returns {Promise<PetType[]>} A promise that resolves to a collection of `PetType`s.
   */
  async findPetTypes(): Promise<PetType[]> {
    return this.find({
      order: {
        name: 'ASC',
      },
    });
  }

  /**
   * @method findByName
   * @description Retrieves a `PetType` from the data store by its name.
   * @param {string} name - The name of the pet type to search for.
   * @returns {Promise<PetType | null>} A promise that resolves to the `PetType` if found, or `null` if not found.
   */
  async findByName(name: string): Promise<PetType | null> {
    return this.findOne({ where: { name } });
  }
}

// Export a singleton instance of the PetTypeRepository
export const petTypeRepository = new PetTypeRepository();
