import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PetType } from './entities/pet-type.entity';

/**
 * Custom repository for the `PetType` entity.
 * Provides specific data access methods for `PetType` objects.
 */
@Injectable()
export class PetTypeRepository extends Repository<PetType> {
  constructor(
    @InjectRepository(PetType)
    private repository: Repository<PetType>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  /**
   * Retrieves all `PetType`s from the data store, ordered by name.
   * @returns A Promise that resolves to a list of `PetType` entities.
   */
  async findPetTypes(): Promise<PetType[]> {
    return this.repository.find({
      order: {
        name: 'ASC', // Order pet types by name in ascending order
      },
    });
  }
}
