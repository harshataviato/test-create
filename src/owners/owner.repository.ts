import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { Owner } from './entities/owner.entity';
import { PaginatedResult, PaginationOptions } from '../common/pagination.interface';

/**
 * @module Owners
 * @description
 * Repository class for `Owner` domain objects.
 * This class provides methods to interact with the database for `Owner` entities,
 * including finding by ID, saving, and searching by last name with pagination.
 * It's analogous to Spring Data JPA's `OwnerRepository` interface.
 */
@Injectable()
export class OwnerRepository {
  constructor(
    @InjectRepository(Owner)
    private readonly ownerRepository: Repository<Owner>,
  ) {}

  /**
   * Retrieves {@link Owner}s from the data store by last name, returning all owners
   * whose last name *starts* with the given name.
   *
   * @param {string} lastName - Value to search for.
   * @param {PaginationOptions} paginationOptions - Options for pagination.
   * @returns {Promise<PaginatedResult<Owner>>} A promise that resolves to a paginated collection of matching {@link Owner}s.
   *                                            Returns an empty collection if none found.
   */
  async findByLastNameStartingWith(lastName: string, paginationOptions: PaginationOptions): Promise<PaginatedResult<Owner>> {
    const { page, limit } = paginationOptions;
    const skip = (page - 1) * limit;

    const findOptions: FindManyOptions<Owner> = {
      where: {
        lastName: Like(`${lastName}%`), // Case-insensitive search for starting characters
      },
      order: { lastName: 'ASC' }, // Sort by last name
      skip,
      take: limit,
      relations: ['pets', 'pets.visits', 'pets.type'], // Eagerly load pets, visits, and pet types
    };

    const [owners, totalItems] = await this.ownerRepository.findAndCount(findOptions);

    return {
      items: owners,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    };
  }

  /**
   * Retrieves an {@link Owner} from the data store by ID.
   * This method returns an {@link Owner} if found, or `undefined` if not found.
   *
   * @param {number} id - The ID to search for.
   * @returns {Promise<Owner | undefined>} A promise that resolves to the {@link Owner} if found, or `undefined` if not found.
   * @throws {NotFoundException} If the owner with the given ID is not found.
   */
  async findById(id: number): Promise<Owner> {
    if (id === null || id === undefined) {
      throw new Error('Owner ID cannot be null or undefined.');
    }

    const owner = await this.ownerRepository.findOne({
      where: { id },
      relations: ['pets', 'pets.visits', 'pets.type'], // Eagerly load pets, visits, and pet types
      order: {
        pets: {
          name: 'ASC', // Order pets by name
          visits: {
            date: 'ASC', // Order visits by date within each pet
          },
        },
      },
    });

    if (!owner) {
      throw new NotFoundException(`Owner with ID ${id} not found.`);
    }
    return owner;
  }

  /**
   * Saves an {@link Owner} entity to the data store.
   * This method can be used for both creating new owners and updating existing ones.
   *
   * @param {Owner} owner - The owner entity to save.
   * @returns {Promise<Owner>} A promise that resolves to the saved {@link Owner} entity.
   */
  async save(owner: Owner): Promise<Owner> {
    return this.ownerRepository.save(owner);
  }
}
