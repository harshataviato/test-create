/**
 * @module repositories/pet-type.repository
 * @description
 * Provides a custom TypeORM repository for the `PetType` entity.
 * Extends TypeORM's `Repository` to include specific data access methods.
 */

import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { PetType } from '../models/owner/pet-type.entity';

/**
 * `PetTypeRepository` provides specialized database operations for `PetType` entities.
 * It's initialized from the `AppDataSource` and includes custom methods
 * for finding all pet types, ordered by name.
 */
export const PetTypeRepository = AppDataSource.getRepository(PetType).extend({
  /**
   * Retrieves all {@link PetType}s from the data store, ordered by name.
   *
   * @returns {Promise<PetType[]>} A promise that resolves to a list of {@link PetType}s.
   */
  async findPetTypes(): Promise<PetType[]> {
    return this.find({ order: { name: 'ASC' } });
  },
});
