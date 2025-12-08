/**
 * @module services/owner/OwnerService
 * @description Provides business logic for managing `Owner` entities.
 *              Interacts with the `OwnerRepository` for data access.
 */

import { ownerRepository } from '@repositories/owner/OwnerRepository';
import { Owner } from '@models/owner/Owner';
import { validate } from 'class-validator';
import { HttpError } from '@utils/errors';
import i18n from 'i18next';

/**
 * @class OwnerService
 * @description Encapsulates business logic related to Owner entities.
 */
export class OwnerService {
  /**
   * @private {typeof ownerRepository} ownerRepo
   * @description Instance of OwnerRepository for database operations.
   */
  private ownerRepo = ownerRepository;

  /**
   * @method findOwnersByLastName
   * @description Retrieves owners whose last name starts with the given string, with pagination.
   * @param {string} lastName - The partial last name to search for.
   * @param {number} page - The current page number (1-indexed).
   * @param {number} pageSize - The number of items per page.
   * @returns {Promise<{ owners: Owner[], totalCount: number, totalPages: number }>} An object containing found owners, total count, and total pages.
   */
  async findOwnersByLastName(lastName: string, page: number, pageSize: number): Promise<{ owners: Owner[]; totalCount: number; totalPages: number }> {
    const { owners, totalCount } = await this.ownerRepo.findByLastNameStartingWith(lastName, page, pageSize);
    return {
      owners,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize)
    };
  }

  /**
   * @method findOwnerById
   * @description Retrieves a single owner by their ID, including their pets and visits.
   * @param {number} id - The ID of the owner to retrieve.
   * @returns {Promise<Owner | null>} The found owner, or `null` if not found.
   */
  async findOwnerById(id: number): Promise<Owner | null> {
    return this.ownerRepo.findByIdWithPetsAndVisits(id);
  }

  /**
   * @method createOwner
   * @description Creates a new owner in the database after validating the provided data.
   * @param {Owner} ownerData - The owner data to create.
   * @returns {Promise<Owner>} The created owner object.
   * @throws {HttpError} If validation fails.
   */
  async createOwner(ownerData: Owner): Promise<Owner> {
    const owner = this.ownerRepo.create(ownerData);
    const errors = await validate(owner);

    if (errors.length > 0) {
      const formattedErrors = errors.map(err => {
        const constraints = err.constraints;
        return Object.values(constraints || {}).map(msg => i18n.t(msg)).join(', ');
      });
      throw new HttpError(400, 'Validation failed: ' + formattedErrors.join('; '));
    }
    return this.ownerRepo.saveOwner(owner);
  }

  /**
   * @method updateOwner
   * @description Updates an existing owner in the database after validating the data.
   * @param {number} id - The ID of the owner to update.
   * @param {Owner} ownerData - The new owner data.
   * @returns {Promise<Owner | null>} The updated owner object, or `null` if the owner was not found.
   * @throws {HttpError} If validation fails or owner is not found.
   */
  async updateOwner(id: number, ownerData: Owner): Promise<Owner | null> {
    const existingOwner = await this.ownerRepo.findByIdWithPetsAndVisits(id);
    if (!existingOwner) {
      throw new HttpError(404, i18n.t('notFound', { field: 'Owner', id }));
    }

    // Merge existing data with new data while preserving relations if not explicitly updated
    // Use `Object.assign` to merge properties from ownerData into existingOwner
    // Ensure `id` remains from existingOwner
    Object.assign(existingOwner, ownerData);
    existingOwner.id = id; // Ensure ID is correctly set from the path

    const errors = await validate(existingOwner);
    if (errors.length > 0) {
      const formattedErrors = errors.map(err => {
        const constraints = err.constraints;
        return Object.values(constraints || {}).map(msg => i18n.t(msg)).join(', ');
      });
      throw new HttpError(400, 'Validation failed: ' + formattedErrors.join('; '));
    }

    return this.ownerRepo.saveOwner(existingOwner);
  }
}

export const ownerService = new OwnerService();
