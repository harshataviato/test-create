/**
 * @module repositories/owner/OwnerRepository
 * @description Custom TypeORM repository for the `Owner` entity,
 *              providing specialized data access methods.
 *              Mimics Spring's `OwnerRepository.java`.
 */

import { Repository } from 'typeorm';
import { AppDataSource } from '@config/database';
import { Owner } from '@models/owner/Owner';

/**
 * @class OwnerRepository
 * @extends {Repository<Owner>}
 * @description Repository class for `Owner` domain objects, extending TypeORM's base Repository.
 */
export class OwnerRepository extends Repository<Owner> {
  constructor() {
    super(Owner, AppDataSource.createEntityManager());
  }

  /**
   * @method findByLastNameStartingWith
   * @description Retrieves `Owner`s from the data store by last name, returning all owners
   *              whose last name *starts* with the given name.
   * @param {string} lastName - Value to search for.
   * @param {number} page - The current page number (1-indexed).
   * @param {number} pageSize - The number of items per page.
   * @returns {Promise<{ owners: Owner[], totalCount: number }>} A promise that resolves to an object containing a list
   *          of matching `Owner`s and the total count (for pagination).
   */
  async findByLastNameStartingWith(
    lastName: string,
    page: number,
    pageSize: number
  ): Promise<{ owners: Owner[]; totalCount: number }> {
    const query = this.createQueryBuilder('owner')
      .leftJoinAndSelect('owner.pets', 'pets')
      .where('owner.lastName ILIKE :lastName', { lastName: `${lastName}%` }) // ILIKE for case-insensitive
      .orderBy('owner.lastName', 'ASC');

    const [owners, totalCount] = await query
      .take(pageSize)
      .skip((page - 1) * pageSize)
      .getManyAndCount();

    return { owners, totalCount };
  }

  /**
   * @method findByIdWithPetsAndVisits
   * @description Retrieves an `Owner` from the data store by ID, including their pets and visits.
   * @param {number} id - The ID of the owner to search for.
   * @returns {Promise<Owner | null>} A promise that resolves to the `Owner` if found, or `null` if not found.
   */
  async findByIdWithPetsAndVisits(id: number): Promise<Owner | null> {
    if (id === null || id === undefined) {
      throw new Error('Owner ID cannot be null or undefined.');
    }
    return this.createQueryBuilder('owner')
      .leftJoinAndSelect('owner.pets', 'pets')
      .leftJoinAndSelect('pets.type', 'type')
      .leftJoinAndSelect('pets.visits', 'visits')
      .orderBy('pets.name', 'ASC') // Order pets by name
      .addOrderBy('visits.date', 'ASC') // Order visits by date
      .where('owner.id = :id', { id })
      .getOne();
  }

  /**
   * @method saveOwner
   * @description Saves an `Owner` entity to the database.
   * @param {Owner} owner - The owner entity to save.
   * @returns {Promise<Owner>} The saved owner entity.
   */
  async saveOwner(owner: Owner): Promise<Owner> {
    return this.save(owner);
  }
}

// Export a singleton instance of the OwnerRepository
export const ownerRepository = new OwnerRepository();
