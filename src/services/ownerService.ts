/**
 * @module services/ownerService
 * @description Provides business logic and orchestrates data operations for Owner entities.
 * This service layer interacts with the OwnerRepository to perform CRUD and query operations.
 */

import { OwnerRepository } from '@repositories/ownerRepository';
import { Owner } from '@models/owner';

/**
 * @class OwnerService
 * @description Encapsulates the business rules for managing owners.
 * It acts as an intermediary between controllers and the data access layer (OwnerRepository).
 */
export class OwnerService {
  private ownerRepository: OwnerRepository;

  /**
   * @constructor
   * @description Initializes the OwnerService with an instance of OwnerRepository.
   */
  constructor() {
    this.ownerRepository = new OwnerRepository();
  }

  /**
   * @method findById
   * @description Retrieves an owner by their unique ID.
   * @param {number} id - The ID of the owner to retrieve.
   * @returns {Owner | undefined} The found Owner entity, or `undefined` if no owner exists with that ID.
   */
  findById(id: number): Owner | undefined {
    return this.ownerRepository.findById(id);
  }

  /**
   * @method findByLastNameStartingWith
   * @description Retrieves a paginated list of owners whose last name starts with a given string.
   * @param {string} lastName - The partial last name to search for.
   * @param {number} page - The current page number (1-based).
   * @param {number} pageSize - The number of results per page.
   * @returns {Owner[]} An array of matching owner entities for the specified page.
   */
  findByLastNameStartingWith(lastName: string, page: number, pageSize: number): Owner[] {
    return this.ownerRepository.findByLastNameStartingWith(lastName, page, pageSize);
  }

  /**
   * @method countByLastNameStartingWith
   * @description Counts the total number of owners whose last name starts with a given string.
   * @param {string} lastName - The partial last name to count.
   * @returns {number} The total count of matching owner entities.
   */
  countByLastNameStartingWith(lastName: string): number {
    return this.ownerRepository.countByLastNameStartingWith(lastName);
  }

  /**
   * @method save
   * @description Saves a new owner or updates an existing one.
   * If the owner's ID is undefined, a new owner is created and assigned an ID.
   * Otherwise, the existing owner with the matching ID is updated.
   * @param {Owner} owner - The owner object to save.
   * @returns {Owner} The saved or updated owner object.
   */
  save(owner: Owner): Owner {
    return this.ownerRepository.save(owner);
  }
}
