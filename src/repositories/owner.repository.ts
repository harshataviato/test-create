/**
 * @module repositories/owner.repository
 * @description
 * Provides a custom TypeORM repository for the `Owner` entity.
 * Extends TypeORM's `Repository` to include specific data access methods
 * that mimic the original Spring Data JPA repository.
 */

import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Owner } from '../models/owner/owner.entity';

/**
 * `OwnerRepository` provides specialized database operations for `Owner` entities.
 * It's initialized from the `AppDataSource` and includes custom methods
 * for finding owners by last name with pagination.
 */
export const OwnerRepository = AppDataSource.getRepository(Owner).extend({
  /**
   * Retrieves a paginated list of {@link Owner}s from the data store
   * whose last name starts with the given string.
   *
   * @param {string} lastName - The value to search for. Case-insensitive.
   * @param {number} skip - The number of items to skip (for pagination offset).
   * @param {number} take - The maximum number of items to return (for page size).
   * @returns {Promise<{ owners: Owner[], total: number }>} A promise that resolves to an object
   *          containing the list of matching {@link Owner}s and the total count of matching owners.
   */
  async findByLastNameStartingWithPaginated(lastName: string, skip: number, take: number): Promise<{ owners: Owner[], total: number }> {
    const queryBuilder = this.createQueryBuilder('owner')
      .leftJoinAndSelect('owner.pets', 'pet') // Eagerly load pets for owners
      .leftJoinAndSelect('pet.visits', 'visit') // Eagerly load visits for pets
      .leftJoinAndSelect('pet.type', 'type') // Eagerly load pet types
      .where('LOWER(owner.lastName) LIKE LOWER(:lastName)', { lastName: `${lastName}%` })
      .orderBy('owner.lastName', 'ASC')
      .addOrderBy('owner.firstName', 'ASC');

    const [owners, total] = await queryBuilder
      .skip(skip)
      .take(take)
      .getManyAndCount();

    return { owners, total };
  },

  /**
   * Retrieves a single {@link Owner} from the data store by id, including their pets and visits.
   *
   * @param {number} id - The id of the owner to search for.
   * @returns {Promise<Owner | null>} A promise that resolves to the {@link Owner} if found,
   *                                  or `null` if not found.
   */
  async findOwnerDetailsById(id: number): Promise<Owner | null> {
    return this.createQueryBuilder('owner')
      .leftJoinAndSelect('owner.pets', 'pet')
      .leftJoinAndSelect('pet.visits', 'visit')
      .leftJoinAndSelect('pet.type', 'type')
      .where('owner.id = :id', { id })
      .orderBy('pet.name', 'ASC')
      .addOrderBy('visit.date', 'ASC')
      .getOne();
  },
});
