/**
 * @module repositories/vet/SpecialtyRepository
 * @description Custom TypeORM repository for the `Specialty` entity,
 *              providing specialized data access methods.
 */

import { Repository } from 'typeorm';
import { AppDataSource } from '@config/database';
import { Specialty } from '@models/vet/Specialty';

/**
 * @class SpecialtyRepository
 * @extends {Repository<Specialty>}
 * @description Repository class for `Specialty` domain objects, extending TypeORM's base Repository.
 */
export class SpecialtyRepository extends Repository<Specialty> {
  constructor() {
    super(Specialty, AppDataSource.createEntityManager());
  }

  /**
   * @method findById
   * @description Retrieves a single `Specialty` from the data store by ID.
   * @param {number} id - The ID of the specialty to search for.
   * @returns {Promise<Specialty | null>} A promise that resolves to the `Specialty` if found, or `null` if not found.
   */
  async findById(id: number): Promise<Specialty | null> {
    if (id === null || id === undefined) {
      throw new Error('Specialty ID cannot be null or undefined.');
    }
    return this.findOne({ where: { id } });
  }

  /**
   * @method findByName
   * @description Retrieves a single `Specialty` from the data store by name.
   * @param {string} name - The name of the specialty to search for.
   * @returns {Promise<Specialty | null>} A promise that resolves to the `Specialty` if found, or `null` if not found.
   */
  async findByName(name: string): Promise<Specialty | null> {
    return this.findOne({ where: { name } });
  }
}

// Export a singleton instance of the SpecialtyRepository
export const specialtyRepository = new SpecialtyRepository();
