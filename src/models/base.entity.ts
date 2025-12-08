/**
 * @module models/base.entity
 * @description
 * Defines the BaseEntity class, providing common properties like `id` and `isNew()`.
 * This serves as the foundation for other entities in the application.
 */

import { PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * BaseEntity serves as a base class for other entities that require an ID.
 * It provides an auto-generated primary key and a utility method `isNew()`
 * to check if the entity has been persisted yet.
 */
export abstract class BaseEntity {
  /**
   * The unique identifier for the entity.
   * This is an auto-incrementing primary key in the database.
   */
  @PrimaryGeneratedColumn()
  id?: number; // `?` indicates that `id` might be undefined for new entities

  /**
   * Checks if the entity is new (i.e., not yet persisted in the database).
   * An entity is considered new if its `id` property is `null` or `undefined`.
   *
   * @returns {boolean} `true` if the entity is new, `false` otherwise.
   */
  isNew(): boolean {
    return this.id === null || this.id === undefined;
  }
}
