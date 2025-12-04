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

// This file is a conceptual TypeScript adaptation of PetTypeRepository.java
// and related Pet-specific service logic.
// It defines interfaces and TypeORM implementations for managing PetType and Pet domain objects.

import { DataSource, Repository } from 'typeorm';
import { AppDataSource } from '../../data-source'; // Assuming TypeORM DataSource
import { Pet, PetType, Visit, Owner } from '../types/models'; // Assuming models are defined
import { Page, Pageable } from '../types/pagination'; // Custom pagination types

/**
 * Interface for managing `PetType` domain objects.
 * Mimics `org.springframework.samples.petclinic.owner.PetTypeRepository`.
 */
export interface PetTypeRepository {
  /**
   * Retrieve all `PetType`s from the data store.
   * @returns A `Collection` (Array) of `PetType`s.
   */
  findPetTypes(): Promise<PetType[]>;

  /**
   * Save a `PetType`.
   * @param petType The pet type to save.
   * @returns The saved pet type.
   */
  save(petType: PetType): Promise<PetType>;
}

/**
 * TypeORM-based implementation of `PetTypeRepository`.
 */
export class TypeOrmPetTypeRepository implements PetTypeRepository {
  private repository: Repository<PetType>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(PetType);
  }

  async findPetTypes(): Promise<PetType[]> {
    return this.repository.find({ order: { name: 'ASC' } });
  }

  async save(petType: PetType): Promise<PetType> {
    return this.repository.save(petType);
  }
}

/**
 * Interface for managing `Pet` domain objects.
 * This corresponds to parts of `OwnerRepository` (for pet-related operations)
 * and direct `Pet` persistence if it were a separate repository.
 */
export interface PetRepository {
  findById(id: number): Promise<Pet | undefined>;
  save(pet: Pet): Promise<Pet>;
  // Additional methods like findPetsByOwnerId, etc.
}

/**
 * TypeORM-based implementation of `PetRepository`.
 */
export class TypeOrmPetRepository implements PetRepository {
  private repository: Repository<Pet>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Pet);
  }

  async findById(id: number): Promise<Pet | undefined> {
    // Eager load related data as needed
    return this.repository.findOne({
      where: { id: id },
      relations: ['type', 'visits'],
    });
  }

  async save(pet: Pet): Promise<Pet> {
    // Ensure relationships are correctly set before saving
    if (pet.type && !pet.type.id) {
        // If pet.type is a new entity, save it first or find existing
        const existingType = await petTypeRepository.findPetTypes().then(types => types.find(t => t.name === pet.type?.name));
        if (existingType) {
            pet.type = existingType;
        } else {
            pet.type = await petTypeRepository.save(pet.type);
        }
    }
    // TypeORM handles cascading saves for visits if configured on the Pet entity
    return this.repository.save(pet);
  }
}

/**
 * A conceptual service layer for `Pet` and `PetType` operations.
 * This encapsulates business logic and coordinates with repositories.
 */
export class PetService {
  constructor(
    private petRepository: PetRepository,
    private petTypeRepository: PetTypeRepository
  ) {}

  async getPetById(id: number): Promise<Pet | undefined> {
    return this.petRepository.findById(id);
  }

  async savePet(pet: Pet): Promise<Pet> {
    return this.petRepository.save(pet);
  }

  async getAllPetTypes(): Promise<PetType[]> {
    return this.petTypeRepository.findPetTypes();
  }

  async getPetTypeByName(name: string): Promise<PetType | undefined> {
    const types = await this.petTypeRepository.findPetTypes();
    return types.find(type => type.name === name);
  }
}

// Export instances for direct use in controllers (simple DI pattern)
export const petTypeRepository = new TypeOrmPetTypeRepository(AppDataSource);
export const petRepository = new TypeOrmPetRepository(AppDataSource);
export const petService = new PetService(petRepository, petTypeRepository);
