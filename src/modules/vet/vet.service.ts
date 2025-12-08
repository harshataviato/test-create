import { Injectable, Inject } from '@nestjs/common';
import { VetRepository } from './vet.repository';
import { Vet } from './entities/vet.entity';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  paginate,
  Pagination,
  IPaginationOptions,
  IPaginationMeta,
} from 'nestjs-typeorm-paginate';

/**
 * Service class for managing `Vet` entities.
 * Encapsulates business logic and interacts with the `VetRepository`.
 */
@Injectable()
export class VetService {
  constructor(
    private readonly vetRepository: VetRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache, // Inject CacheManager for manual cache control
  ) {}

  /**
   * Retrieves all `Vet` entities from the data store.
   * This method uses caching (`@Cacheable` in Spring, simulated manually here)
   * to reduce database load for frequently accessed data.
   * @returns A Promise that resolves to a list of `Vet` entities.
   */
  async findAll(): Promise<Vet[]> {
    // Attempt to retrieve vets from cache first
    let vets = await this.cacheManager.get<Vet[]>('vets');

    if (!vets) {
      // If not in cache, fetch from database and store in cache
      vets = await this.vetRepository.find({ relations: ['specialties'] });
      await this.cacheManager.set('vets', vets, 300 * 1000); // Cache for 5 minutes (300 seconds)
    }
    return vets;
  }

  /**
   * Retrieves all `Vet` entities from the data store with pagination.
   * This method also uses caching.
   * @param page The page number to retrieve.
   * @param limit The maximum number of items per page.
   * @returns A Promise that resolves to a paginated list of `Vet` entities.
   */
  async findAllPaginated(
    page: number,
    limit: number,
  ): Promise<Pagination<Vet, IPaginationMeta>> {
    const options: IPaginationOptions = { page, limit };
    const queryBuilder = this.vetRepository
      .createQueryBuilder('vet')
      .leftJoinAndSelect('vet.specialties', 'specialty') // Eagerly load specialties
      .orderBy('vet.lastName', 'ASC'); // Order by last name

    return paginate<Vet, IPaginationMeta>(queryBuilder, options);
  }
}
