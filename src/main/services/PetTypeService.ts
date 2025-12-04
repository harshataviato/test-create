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
// and related PetType-specific service logic.
// It defines interfaces and a TypeORM implementation for managing PetType domain objects.

import { DataSource, Repository } from 'typeorm';
import { AppDataSource } from '../../data-source'; // Assuming TypeORM DataSource
import { PetType } from '../types/models'; // Assuming PetType model is defined

/**
 * Interface for managing `PetType` domain objects.
 * Mimics `org.springframework.samples.petclinic.owner.PetTypeRepository`.
 */
export interface PetTypeRepository {
  /**
   * Retrieve all {@link PetType}s from the data store.
   * Mimics `@Query("SELECT ptype FROM PetType ptype ORDER BY ptype.name")`
   * and `List<PetType> findPetTypes();`.
   * @returns A `Collection` (Array) of {@link PetType}s, ordered by name.
   */
  findPetTypes(): Promise<PetType[]>;

  /**
   * Save a `PetType`.
   * @param petType The pet type to save.
   * @returns The saved pet type.
   */
  save(petType: PetType): Promise<PetType>;

  /**
   * Find a PetType by its name.
   * @param name The name of the pet type to find.
   * @returns The PetType if found, otherwise undefined.
   */
  findByName(name: string): Promise<PetType | undefined>;
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
    // Mimics `@Query("SELECT ptype FROM PetType ptype ORDER BY ptype.name")`
    return this.repository.find({ order: { name: 'ASC' } });
  }

  async save(petType: PetType): Promise<PetType> {
    return this.repository.save(petType);
  }

  async findByName(name: string): Promise<PetType | undefined> {
    return this.repository.findOne({ where: { name: name } });
  }
}

/**
 * A conceptual service layer for `PetType` operations.
 * This encapsulates business logic and coordinates with repositories.
 */
export class PetTypeService {
  constructor(private repository: PetTypeRepository) {}

  async getAllPetTypes(): Promise<PetType[]> {
    return this.repository.findPetTypes();
  }

  async getPetTypeByName(name: string): Promise<PetType | undefined> {
    return this.repository.findByName(name);
  }

  async savePetType(petType: PetType): Promise<PetType> {
    return this.repository.save(petType);
  }
}

// Export instances for direct use in controllers (simple DI pattern)
export const petTypeRepository = new TypeOrmPetTypeRepository(AppDataSource);
export const petTypeService = new PetTypeService(petTypeRepository);
