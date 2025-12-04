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

// This file is a conceptual TypeScript adaptation of OwnerRepository.java.
// It defines an interface and a TypeORM implementation for managing Owner domain objects.
// It mimics Spring Data JPA's repository pattern, including custom query methods.

import { DataSource, Repository, Like } from 'typeorm';
import { AppDataSource } from '../../data-source'; // Assuming TypeORM DataSource
import { Owner, PetType } from '../types/models'; // Assuming Owner and PetType models
import { Page, Pageable } from '../types/pagination'; // Custom pagination types
import { petTypeRepository } from './PetService'; // Import petTypeRepository for PetType management

/**
 * Interface for managing `Owner` domain objects.
 * Mimics `org.springframework.samples.petclinic.owner.OwnerRepository`.
 */
export interface OwnerRepository {
  /**
   * Retrieve {@link Owner}s from the data store by last name, returning all owners
   * whose last name *starts* with the given name.
   * Mimics `Page<Owner> findByLastNameStartingWith(String lastName, Pageable pageable);`.
   * @param lastName Value to search for.
   * @param pageable Pagination information.
   * @returns A `Page` of matching {@link Owner}s.
   */
  findByLastNameStartingWith(lastName: string, pageable: Pageable): Promise<Page<Owner>>;

  /**
   * Retrieve an {@link Owner} from the data store by id.
   * Mimics `Optional<Owner> findById(Integer id);`.
   * @param id The id to search for.
   * @returns An {@link Optional} (or `Promise<Owner | undefined>`) containing the {@link Owner} if found.
   */
  findById(id: number): Promise<Owner | undefined>;

  /**
   * Saves an {@link Owner} to the data store.
   * Mimics `Owner save(Owner owner);`.
   * @param owner The owner to save.
   * @returns The saved {@link Owner}.
   */
  save(owner: Owner): Promise<Owner>;
}

/**
 * TypeORM-based implementation of `OwnerRepository`.
 */
export class TypeOrmOwnerRepository implements OwnerRepository {
  private ownerRepository: Repository<Owner>;

  constructor(dataSource: DataSource) {
    this.ownerRepository = dataSource.getRepository(Owner);
  }

  /**
   * Retrieves owners whose last name starts with the given string, with pagination.
   * Mimics Spring Data JPA's query derivation from method names.
   */
  async findByLastNameStartingWith(lastName: string, pageable: Pageable): Promise<Page<Owner>> {
    const whereCondition = lastName ? { lastName: Like(`${lastName}%`) } : {};
    const [owners, total] = await this.ownerRepository.findAndCount({
      where: whereCondition,
      relations: ['pets', 'pets.type', 'pets.visits'], // Eager load pets, their types, and visits
      order: { lastName: 'ASC', firstName: 'ASC' },
      skip: pageable.pageNumber * pageable.pageSize,
      take: pageable.pageSize,
    });

    return {
      content: owners,
      pageNumber: pageable.pageNumber,
      pageSize: pageable.pageSize,
      totalElements: total,
      totalPages: Math.ceil(total / pageable.pageSize),
      isFirst: pageable.pageNumber === 0,
      isLast: pageable.pageNumber === Math.ceil(total / pageable.pageSize) - 1,
    };
  }

  /**
   * Retrieves an owner by ID.
   * Mimics Spring Data JPA's `findById`.
   */
  async findById(id: number): Promise<Owner | undefined> {
    // Mimics the eager loading behavior of Spring Data JPA for Owner.
    // The `relations` option ensures pets, their types, and visits are loaded.
    const owner = await this.ownerRepository.findOne({
      where: { id: id },
      relations: ['pets', 'pets.type', 'pets.visits'],
    });

    // Throw IllegalArgumentException if ID is null, as per Java doc.
    if (id === null || id === undefined) {
      throw new Error("IllegalArgumentException: id cannot be null");
    }

    return owner || undefined; // Return undefined if not found, matching `Optional.empty()`
  }

  /**
   * Saves an owner, cascading to pets and visits.
   */
  async save(owner: Owner): Promise<Owner> {
    // When saving an owner, TypeORM automatically handles cascades if configured
    // in the entity definitions (e.g., `cascade: true` on `@OneToMany`).
    // Ensure all relationships (pets, pet.type, pet.visits) are correctly linked
    // before saving the owner.
    if (owner.pets) {
      for (const pet of owner.pets) {
        if (pet.type && !pet.type.id) {
          // If pet.type is a new entity (only name is present), find existing or save new.
          // This uses `petTypeRepository` to manage PetType entities, demonstrating
          // service orchestration.
          const existingType = await petTypeRepository.getPetTypeByName(pet.type.name);
          if (existingType) {
            pet.type = existingType;
            pet.typeId = existingType.id;
          } else {
            // If the type doesn't exist, create and save it.
            const newType = new PetType();
            newType.name = pet.type.name;
            const savedType = await petTypeRepository.save(newType);
            pet.type = savedType;
            pet.typeId = savedType.id;
          }
        } else if (pet.type && pet.type.id) {
            // If type exists and has an ID, ensure typeId FK is set
            pet.typeId = pet.type.id;
        }

        if (pet.visits) {
            for (const visit of pet.visits) {
                visit.pet = pet; // Ensure inverse relation is set for cascade
                visit.petId = pet.id; // Explicitly set FK if needed
            }
        }
        pet.owner = owner; // Ensure inverse relation is set for cascade
        pet.ownerId = owner.id; // Explicitly set FK if needed
      }
    }

    const savedOwner = await this.ownerRepository.save(owner);
    return savedOwner;
  }
}

/**
 * A conceptual service layer for `Owner` operations.
 * This encapsulates business logic and coordinates with repositories.
 */
export class OwnerService {
  constructor(private repository: OwnerRepository) {}

  async findOwnersByLastNameStartingWith(lastName: string, pageNumber: number, pageSize: number): Promise<Page<Owner>> {
    return this.repository.findByLastNameStartingWith(lastName, { pageNumber, pageSize });
  }

  async findOwnerById(id: number): Promise<Owner | undefined> {
    return this.repository.findById(id);
  }

  async saveOwner(owner: Owner): Promise<Owner> {
    return this.repository.save(owner);
  }
}

// Export instances for direct use in controllers (simple DI pattern)
export const ownerRepository = new TypeOrmOwnerRepository(AppDataSource);
export const ownerService = new OwnerService(ownerRepository);
