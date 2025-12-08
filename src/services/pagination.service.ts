/**
 * @module services/pagination.service
 * @description
 * Provides a generic pagination service for TypeORM repositories.
 * It abstracts away the logic for fetching paginated data and calculating
 * total pages.
 */

import { Repository, FindManyOptions, FindOptionsWhere, ObjectLiteral, FindOptionsRelations } from 'typeorm';
import { appConfig } from '../config/app.config';

/**
 * Interface defining the structure of paginated results.
 */
export interface PaginatedResult<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

/**
 * `PaginationService` provides a utility method to fetch paginated data from any TypeORM repository.
 */
class PaginationService {
  /**
   * Retrieves paginated data from a TypeORM repository.
   *
   * @template T The entity type.
   * @param {Repository<T>} repository The TypeORM repository instance.
   * @param {number} page The current page number (1-indexed).
   * @param {number} pageSize The number of items per page.
   * @param {FindOptionsWhere<T> | ObjectLiteral | undefined} [where] Optional WHERE conditions for the query.
   * @param {FindOptionsRelations<T>} [relations] Optional relations to eager-load.
   * @param {FindManyOptions<T>['order']} [order] Optional order by conditions.
   * @returns {Promise<PaginatedResult<T>>} A promise that resolves to an object containing
   *   the items for the current page, total items, total pages, current page, and page size.
   */
  async findPaginated<T extends ObjectLiteral>(
    repository: Repository<T>,
    page: number,
    pageSize: number = appConfig.pageSize,
    where: FindOptionsWhere<T> | ObjectLiteral | undefined = {},
    relations: FindOptionsRelations<T> = {},
    order: FindManyOptions<T>['order'] = {}
  ): Promise<PaginatedResult<T>> {
    const skip = (page - 1) * pageSize;

    // Build the query builder
    const queryBuilder = repository.createQueryBuilder();

    // Apply relations if provided
    for (const relationKey in relations) {
      if (relations[relationKey]) {
        queryBuilder.leftJoinAndSelect(`${queryBuilder.alias}.${String(relationKey)}`, String(relationKey));
      }
    }

    // Apply where conditions
    // Note: If `where` contains complex conditions (e.g., LIKE, OR), direct use of findAndCount might be limited.
    // For more complex queries, `createQueryBuilder` is more flexible.
    if (Object.keys(where).length > 0) {
      // Assuming `where` contains direct column-value mappings or simple LIKE for specific fields
      // This part needs to be adapted based on how complex the `where` object can be.
      // For `lastName` LIKE queries from `OwnerRepository`, we need specific handling.
      if ('lastName' in where && typeof where.lastName === 'string') {
        queryBuilder.andWhere('LOWER(owner.lastName) LIKE LOWER(:lastName)', { lastName: `${where.lastName}%` });
        // Remove lastName from `where` to avoid duplicate processing if passed to other parts
        delete (where as any).lastName;
      }

      // Add other simple where clauses
      for (const key in where) {
        if (Object.prototype.hasOwnProperty.call(where, key)) {
          queryBuilder.andWhere(`${queryBuilder.alias}.${String(key)} = :${String(key)}`, { [key]: (where as any)[key] });
        }
      }
    }

    // Apply order by conditions
    if (Object.keys(order).length > 0) {
      // TypeORM's query builder expects order by clauses directly
      let firstOrder = true;
      for (const key in order) {
        if (Object.prototype.hasOwnProperty.call(order, key)) {
          const sortDirection = (order as any)[key].toUpperCase(); // ASC or DESC
          if (firstOrder) {
            queryBuilder.orderBy(`${queryBuilder.alias}.${String(key)}`, sortDirection);
            firstOrder = false;
          } else {
            queryBuilder.addOrderBy(`${queryBuilder.alias}.${String(key)}`, sortDirection);
          }
        }
      }
    } else {
      // Default order for consistency if none provided
      // For example, order by ID descending or a sensible default for the entity
      queryBuilder.orderBy(`${queryBuilder.alias}.id`, 'DESC');
    }


    const [items, totalItems] = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      items,
      totalItems,
      totalPages,
      currentPage: page,
      pageSize,
    };
  }
}

export const paginationService = new PaginationService();
