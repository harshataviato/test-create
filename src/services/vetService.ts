/**
 * @module services/vetService
 * @description Provides business logic and orchestrates data operations for Vet entities.
 * This service layer interacts with the VetRepository to perform query operations.
 */

import { VetRepository } from '@repositories/vetRepository';
import { Vet } from '@models/vet';

/**
 * @class VetService
 * @description Encapsulates the business rules for managing veterinarians.
 * It acts as an intermediary between controllers and the data access layer (VetRepository).
 */
export class VetService {
  private vetRepository: VetRepository;

  /**
   * @constructor
   * @description Initializes the VetService with an instance of VetRepository.
   */
  constructor() {
    this.vetRepository = new VetRepository();
  }

  /**
   * @method findAll
   * @description Retrieves all veterinarian entities.
   * The specialties within each vet are also returned, sorted by name.
   * @returns {Vet[]} An array of all Vet entities.
   */
  findAll(): Vet[] {
    return this.vetRepository.findAll();
  }

  /**
   * @method findAllPaginated
   * @description Retrieves a paginated list of veterinarian entities.
   * @param {number} page - The current page number (1-based).
   * @param {number} pageSize - The number of results per page.
   * @returns {Vet[]} An array of Vet entities for the specified page.
   */
  findAllPaginated(page: number, pageSize: number): Vet[] {
    return this.vetRepository.findAllPaginated(page, pageSize);
  }

  /**
   * @method countAllVets
   * @description Counts the total number of veterinarian entities.
   * @returns {number} The total count of Vet entities.
   */
  countAllVets(): number {
    return this.vetRepository.countAllVets();
  }
}
