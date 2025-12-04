/*
 * Copyright 2012-2025 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// This file is a conceptual TypeScript adaptation of VetRepository.java.
// It defines an interface and a mock implementation for managing Vet domain objects,
// mimicking Spring Data JPA's repository pattern and caching.

import { Vet, Specialty, Vets } from '../types/models'; // Assuming these models are defined
import { DataSource, Repository } from 'typeorm';
import { AppDataSource } from '../../data-source'; // Assuming TypeORM DataSource
import { Page, Pageable } from '../types/pagination'; // Custom pagination types

/**
 * Interface for managing `Vet` domain objects.
 * Mimics `org.springframework.samples.petclinic.vet.VetRepository`.
 */
export interface VetRepository {
  /**
   * Retrieve all `Vet`s from the data store.
   * Mimics `@Transactional(readOnly = true)` and `@Cacheable("vets")`.
   * @returns A `Collection` (Array) of `Vet`s.
   */
  findAll(): Promise<Vet[]>;

  /**
   * Retrieve all `Vet`s from data store in Pages.
   * Mimics `@Transactional(readOnly = true)` and `@Cacheable("vets")`.
   * @param pageable Pagination information.
   * @returns A `Page` of `Vet`s.
   */
  findAllPaginated(pageable: Pageable): Promise<Page<Vet>>;
}

/**
 * TypeORM-based implementation of `VetRepository`.
 * This would be the actual implementation connecting to a database.
 */
export class TypeOrmVetRepository implements VetRepository {
  private vetRepository: Repository<Vet>;
  private specialtyRepository: Repository<Specialty>;
  private cache = new Map<string, any>(); // Simple in-memory cache

  constructor(dataSource: DataSource) {
    this.vetRepository = dataSource.getRepository(Vet);
    this.specialtyRepository = dataSource.getRepository(Specialty);
  }

  // --- Cacheable implementation ---
  private getFromCache<T>(key: string, fetchFunction: () => Promise<T>): Promise<T> {
    if (this.cache.has(key)) {
      console.log(`[Cache] Cache hit for key: ${key}`);
      return Promise.resolve(this.cache.get(key));
    }
    console.log(`[Cache] Cache miss for key: ${key}, fetching...`);
    const promise = fetchFunction();
    promise.then(data => {
      this.cache.set(key, data);
      // In a real app, implement cache invalidation strategies
    });
    return promise;
  }

  async findAll(): Promise<Vet[]> {
    // Mimics @Cacheable("vets") with a simple cache key
    return this.getFromCache('allVets', async () => {
      // Load vets with their specialties eager-loaded (configured in Vet entity)
      const vets = await this.vetRepository.find({ relations: ['vetSpecialties', 'vetSpecialties.specialty'] });
      return vets;
    });
  }

  async findAllPaginated(pageable: Pageable): Promise<Page<Vet>> {
    // Mimics @Cacheable("vets") with a cache key including page info
    const cacheKey = `vets-page-${pageable.pageNumber}-${pageable.pageSize}`;
    return this.getFromCache(cacheKey, async () => {
      const [vets, total] = await this.vetRepository.findAndCount({
        skip: pageable.pageNumber * pageable.pageSize,
        take: pageable.pageSize,
        relations: ['vetSpecialties', 'vetSpecialties.specialty'],
        order: { lastName: 'ASC', firstName: 'ASC' }, // Example ordering
      });
      return {
        content: vets,
        pageNumber: pageable.pageNumber,
        pageSize: pageable.pageSize,
        totalElements: total,
        totalPages: Math.ceil(total / pageable.pageSize),
        isFirst: pageable.pageNumber === 0,
        isLast: pageable.pageNumber === Math.ceil(total / pageable.pageSize) - 1,
      };
    });
  }
}

// Global instance or dependency injection for the repository
export const vetRepository = new TypeOrmVetRepository(AppDataSource);

/**
 * A conceptual service layer for `Vet` operations, if separate from the repository.
 * The original `VetRepository` was an interface, and the actual implementation
 * (e.g., Spring Data JPA) was the "service" in that context.
 * For Node.js, we can define an explicit service class for business logic.
 */
export class VetService {
  constructor(private repository: VetRepository) {}

  async getAllVets(): Promise<Vets> {
    const allVets = await this.repository.findAll();
    const vetsContainer = new Vets();
    vetsContainer.setVetList(allVets);
    return vetsContainer;
  }

  async getPaginatedVets(pageNumber: number, pageSize: number): Promise<Page<Vet>> {
    return this.repository.findAllPaginated({ pageNumber, pageSize });
  }
}

export const vetService = new VetService(vetRepository);
