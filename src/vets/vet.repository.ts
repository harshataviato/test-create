import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, SelectQueryBuilder } from 'typeorm';
import { Vet } from './entities/vet.entity';
import { PaginationOptions } from '../common/pagination.interface';
import { PaginatedResult } from '../common/pagination.interface';

/**
 * @module Vets
 * @description
 * Repository class for `Vet` domain objects.
 * This class provides methods to interact with the database for `Vet` entities,
 * including fetching all vets and paginated results.
 * It's analogous to Spring Data JPA's `VetRepository` interface.
 */
@Injectable()
export class VetRepository {
  constructor(
    @InjectRepository(Vet)
    private readonly vetRepository: Repository<Vet>,
  ) {}

  /**
   * Retrieves all `Vet`s from the data store.
   * This method uses caching to improve performance for frequently accessed vet lists.
   *
   * @returns {Promise<Vet[]>} A promise that resolves to a collection of `Vet`s.
   */
  async findAll(): Promise<Vet[]> {
    // TypeORM automatically handles eager loading for 'specialties' due to @ManyToMany(eager: true)
    return this.vetRepository.find();
  }

  /**
   * Retrieves all `Vet`s from the data store in paginated form.
   *
   * @param {PaginationOptions} paginationOptions - Options for pagination, including page number and page size.
   * @returns {Promise<PaginatedResult<Vet>>} A promise that resolves to a paginated result of `Vet`s.
   */
  async findAllPaginated(paginationOptions: PaginationOptions): Promise<PaginatedResult<Vet>> {
    const { page, limit } = paginationOptions;
    const skip = (page - 1) * limit;

    const [vets, totalItems] = await this.vetRepository.findAndCount({
      skip,
      take: limit,
      relations: ['specialties'], // Ensure specialties are loaded
      order: { lastName: 'ASC' }, // Default sorting
    });

    return {
      items: vets,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    };
  }
}
