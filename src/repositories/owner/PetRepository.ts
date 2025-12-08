/**
 * @module repositories/owner/PetRepository
 * @description Custom TypeORM repository for the `Pet` entity,
 *              providing specialized data access methods.
 */

import { Repository } from 'typeorm';
import { AppDataSource } from '@config/database';
import { Pet } from '@models/owner/Pet';

/**
 * @class PetRepository
 * @extends {Repository<Pet>}
 * @description Repository class for `Pet` domain objects, extending TypeORM's base Repository.
 */
export class PetRepository extends Repository<Pet> {
  constructor() {
    super(Pet, AppDataSource.createEntityManager());
  }

  /**
   * @method findByIdWithDetails
   * @description Retrieves a `Pet` from the data store by ID, including its owner, type, and visits.
   * @param {number} id - The ID of the pet to search for.
   * @returns {Promise<Pet | null>} A promise that resolves to the `Pet` if found, or `null` if not found.
   */
  async findByIdWithDetails(id: number): Promise<Pet | null> {
    if (id === null || id === undefined) {
      throw new Error('Pet ID cannot be null or undefined.');
    }
    return this.createQueryBuilder('pet')
      .leftJoinAndSelect('pet.owner', 'owner')
      .leftJoinAndSelect('pet.type', 'type')
      .leftJoinAndSelect('pet.visits', 'visits')
      .where('pet.id = :id', { id })
      .getOne();
  }

  /**
   * @method savePet
   * @description Saves a `Pet` entity to the database.
   * @param {Pet} pet - The pet entity to save.
   * @returns {Promise<Pet>} The saved pet entity.
   */
  async savePet(pet: Pet): Promise<Pet> {
    return this.save(pet);
  }
}

// Export a singleton instance of the PetRepository
export const petRepository = new PetRepository();
