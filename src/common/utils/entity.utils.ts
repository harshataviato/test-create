import { BaseEntity } from '../entities/base.entity';
import { NotFoundException } from '@nestjs/common';

/**
 * Utility methods for handling entities.
 */
export abstract class EntityUtils {
  /**
   * Looks up an entity of the given class with the given ID in the provided collection.
   *
   * @param entities The collection of entities to search within.
   * @param entityClass The class of the entity to look up.
   * @param entityId The ID of the entity to find.
   * @returns The found entity.
   * @throws NotFoundException if the entity was not found in the collection.
   *
   * @template T A type that extends `BaseEntity`.
   */
  static getById<T extends BaseEntity>(
    entities: T[],
    entityClass: new () => T,
    entityId: number,
  ): T {
    for (const entity of entities) {
      // Check if entity is not new, its ID matches, and it's an instance of the target class
      if (
        entity.id !== undefined &&
        entity.id === entityId &&
        entity instanceof entityClass
      ) {
        return entity;
      }
    }
    // If no entity is found, throw a NotFoundException
    throw new NotFoundException(
      `Entity of type ${entityClass.name} with ID ${entityId} not found.`,
    );
  }
}
