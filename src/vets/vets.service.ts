import { Injectable } from '@nestjs/common';
import { VetRepository } from './vet.repository';
import { Vet } from './entities/vet.entity';
import { PaginationOptions, PaginatedResult } from '../common/pagination.interface';

/**
 * @module Vets
 * @description
 * Service class for managing `Vet` entities.
 * This service encapsulates the business logic for veterinarians,
 * interacting with the `VetRepository` to perform data operations.
 */
@Injectable()
export class VetsService {
  constructor(private readonly vetRepository: VetRepository) {}

  /**
   * Retrieves all `Vet`s from the data store.
   *
   * @returns {Promise<Vet[]>} A promise that resolves to a collection of `Vet`s.
   */
  async findAllVets(): Promise<Vet[]> {
    return this.vetRepository.findAll();
  }

  /**
   * Retrieves all `Vet`s from the data store in paginated form.
   *
   * @param {PaginationOptions} paginationOptions - Options for pagination.
   * @returns {Promise<PaginatedResult<Vet>>} A promise that resolves to a paginated result of `Vet`s.
   */
  async findAllVetsPaginated(paginationOptions: PaginationOptions): Promise<PaginatedResult<Vet>> {
    return this.vetRepository.findAllPaginated(paginationOptions);
  }
}
