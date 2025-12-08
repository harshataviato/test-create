/**
 * @module repositories/vet/VetRepository
 * @description Custom TypeORM repository for the `Vet` entity,
 *              providing specialized data access methods, including caching.
 *              Mimics Spring's `VetRepository.java`.
 */

import { Repository } from 'typeorm';
import { AppDataSource } from '@config/database';
import { Vet } from '@models/vet/Vet';
import { CacheService } from '@utils/cache';

/**
 * @class VetRepository
 * @extends {Repository<Vet>}
 * @description Repository class for `Vet` domain objects, extending TypeORM's base Repository.
 *              Includes caching logic for `findAll` methods.
 */
export class VetRepository extends Repository<Vet> {
  private cacheService: CacheService;

  constructor() {
    super(Vet, AppDataSource.createEntityManager());
    this.cacheService = new CacheService();
  }

  /**
   * @method findAllVets
   * @description Retrieves all `Vet`s from the data store.
   *              Results are cached to improve performance for subsequent calls.
   * @returns {Promise<Vet[]>} A promise that resolves to a collection of `Vet`s.
   */
  async findAllVets(): Promise<Vet[]> {
    const cacheKey = 'allVets';
    let vets = this.cacheService.get<Vet[]>(cacheKey);

    if (vets) {
      console.log('Serving vets from cache.');
      return vets;
    }

    console.log('Fetching vets from database...');
    vets = await this.find({ relations: ['specialties'], order: { lastName: 'ASC' } });
    this.cacheService.set(cacheKey, vets, 3600); // Cache for 1 hour
    return vets;
  }

  /**
   * @method findAllVetsPaginated
   * @description Retrieves all `Vet`s from data store in pages.
   *              Results for each page are cached.
   * @param {number} page - The current page number (1-indexed).
   * @param {number} pageSize - The number of items per page.
   * @returns {Promise<{ vets: Vet[], totalCount: number, totalPages: number }>} A promise that resolves to an object
   *          containing a list of `Vet`s, total count, and total pages for the given pagination.
   */
  async findAllVetsPaginated(
    page: number,
    pageSize: number
  ): Promise<{ vets: Vet[]; totalCount: number; totalPages: number }> {
    const cacheKey = `vetsPage_${page}_${pageSize}`;
    let cachedData = this.cacheService.get<{ vets: Vet[]; totalCount: number }>(cacheKey);

    if (cachedData) {
      console.log(`Serving vets for page ${page} from cache.`);
      return {
        vets: cachedData.vets,
        totalCount: cachedData.totalCount,
        totalPages: Math.ceil(cachedData.totalCount / pageSize),
      };
    }

    console.log(`Fetching vets from database for page ${page}...`);
    const [vets, totalCount] = await this.findAndCount({
      relations: ['specialties'],
      order: { lastName: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    this.cacheService.set(cacheKey, { vets, totalCount }, 3600); // Cache for 1 hour

    return {
      vets,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  }
}

// Export a singleton instance of the VetRepository
export const vetRepository = new VetRepository();
