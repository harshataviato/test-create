import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PetType } from './entities/pet-type.entity';

/**
 * @module Owners
 * @description
 * Repository class for `PetType` domain objects.
 * This class provides methods to interact with the database for `PetType` entities,
 * primarily for retrieving all available pet types.
 * It's analogous to Spring Data JPA's `PetTypeRepository` interface.
 */
@Injectable()
export class PetTypeRepository {
  constructor(
    @InjectRepository(PetType)
    private readonly petTypeRepository: Repository<PetType>,
  ) {}

  /**
   * Retrieves all {@link PetType}s from the data store.
   * The results are ordered by the pet type's name.
   *
   * @returns {Promise<PetType[]>} A promise that resolves to a collection of {@link PetType}s.
   */
  async findPetTypes(): Promise<PetType[]> {
    return this.petTypeRepository.find({
      order: { name: 'ASC' }, // Order pet types by name
    });
  }
}
