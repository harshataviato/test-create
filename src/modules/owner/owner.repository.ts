import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Owner } from './entities/owner.entity';
import {
  paginate,
  Pagination,
  IPaginationOptions,
  IPaginationMeta,
} from 'nestjs-typeorm-paginate';

/**
 * Custom repository for the `Owner` entity.
 * Extends TypeORM's `Repository` to provide specific data access methods for `Owner` objects.
 */
@Injectable()
export class OwnerRepository extends Repository<Owner> {
  constructor(
    @InjectRepository(Owner)
    private repository: Repository<Owner>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  /**
   * Retrieves owners from the data store by last name, returning all owners
   * whose last name starts with the given name, with pagination.
   *
   * @param lastName The value to search for (case-insensitive, starting with).
   * @param options Pagination options (page number, limit).
   * @returns A `Pagination` object containing matching `Owner` entities.
   */
  async paginateOwnersByLastName(
    lastName: string,
    options: IPaginationOptions,
  ): Promise<Pagination<Owner, IPaginationMeta>> {
    const queryBuilder = this.repository
      .createQueryBuilder('owner')
      .orderBy('owner.lastName', 'ASC');

    if (lastName) {
      queryBuilder.where('LOWER(owner.lastName) LIKE LOWER(:lastName)', {
        lastName: `${lastName}%`,
      });
    }

    return paginate<Owner, IPaginationMeta>(queryBuilder, options);
  }
}
