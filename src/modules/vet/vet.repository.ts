import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vet } from './entities/vet.entity';

/**
 * Custom repository for the `Vet` entity.
 * Extends TypeORM's `Repository` to provide specific data access methods for `Vet` objects.
 */
@Injectable()
export class VetRepository extends Repository<Vet> {
  constructor(
    @InjectRepository(Vet)
    private repository: Repository<Vet>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  // Custom methods can be added here if needed,
  // beyond what TypeORM's default repository provides.
  // For now, `findAll` and `findAllPaginated` are handled in VetService
  // using basic `find` and `createQueryBuilder` from the base repository.
}
