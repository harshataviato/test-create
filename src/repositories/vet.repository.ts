/**
 * @module repositories/vet.repository
 * @description
 * Provides a custom TypeORM repository for the `Vet` entity.
 * Extends TypeORM's `Repository` to include specific data access methods
 * and implements a simple in-memory cache for the `findAll` operation.
 */

import { Repository, FindManyOptions } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Vet } from '../models/vet/vet.entity';
import { Constants } from '../utils/constants';

// Simple in-memory cache for vets
const vetsCache: {
  allVets: Vet[] | null;
  timestamp: number;
} = {
  allVets: null,
  timestamp: 0,
};

/**
 * `VetRepository` provides specialized database operations for `Vet` entities.
 * It's initialized from the `AppDataSource` and includes custom methods
 * for finding all vets, with caching.
 */
export const VetRepository = AppDataSource.getRepository(Vet).extend({
  /**
   * Retrieves all `Vet`s from the data store.
   * Implements a simple in-memory cache to reduce database load for this frequently accessed data.
   * The cache is cleared after a defined duration (e.g., 5 minutes).
   *
   * @returns {Promise<Vet[]>} A promise that resolves to a list of `Vet`s.
   */
  async findAll(): Promise<Vet[]> {
    const now = Date.now();
    // Check if cache is still valid
    if (vetsCache.allVets && (now - vetsCache.timestamp < Constants.VET_CACHE_TTL)) {
      console.log('Serving vets from cache.');
      return vetsCache.allVets;
    }

    console.log('Fetching vets from database and updating cache.');
    // Fetch from DB if cache is stale or empty
    const vets = await this.find({
      relations: ['specialties'], // Eagerly load specialties
      order: { lastName: 'ASC', firstName: 'ASC' },
    });

    // Update cache
    vetsCache.allVets = vets;
    vetsCache.timestamp = now;

    return vets;
  },

  /**
   * Retrieves a paginated list of `Vet`s from the data store.
   * This method uses caching for the full list, but pagination might bypass it
   * or retrieve the full list and then paginate in memory if performance allows.
   * For simplicity, this implementation retrieves all and then applies skip/take in memory.
   * In a real-world scenario with large datasets, `findAll` would be adapted to use
   * TypeORM's `findAndCount` with `skip`/`take` directly on the database query.
   *
   * @param {number} skip - The number of items to skip (for pagination offset).
   * @param {number} take - The maximum number of items to return (for page size).
   * @returns {Promise<{ vets: Vet[], total: number }>} A promise that resolves to an object
   *          containing the list of `Vet`s for the current page and the total count of vets.
   */
  async findAllPaginated(skip: number, take: number): Promise<{ vets: Vet[], total: number }> {
    // For smaller datasets, fetching all and then paginating is acceptable.
    // For large datasets, this should be optimized to use `findAndCount` with `skip` and `take` directly on the database.
    const allVets = await this.findAll(); // This benefits from the cache
    const paginatedVets = allVets.slice(skip, skip + take);
    return { vets: paginatedVets, total: allVets.length };
  },
});
