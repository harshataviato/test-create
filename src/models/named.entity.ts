/**
 * @module models/named.entity
 * @description
 * Extends `BaseEntity` by adding a `name` property.
 * This is useful for entities that can be identified by a name, such as PetType or Specialty.
 */

import { Column } from 'typeorm';
import { BaseEntity } from './base.entity';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * NamedEntity extends BaseEntity and adds a 'name' property.
 * It includes validation constraints for the 'name' field.
 */
export abstract class NamedEntity extends BaseEntity {
  /**
   * The name of the entity.
   * - Must not be empty.
   * - Must be a string.
   * - Maximum length of 80 characters.
   */
  @Column({ length: 80 })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  @MaxLength(80, { message: 'Name cannot be longer than 80 characters' })
  name?: string; // `?` indicates it might be undefined for new entities

  /**
   * Returns a string representation of the entity, primarily its name.
   * If the name is not set, it returns '<null>'.
   *
   * @returns {string} The name of the entity or '<null>'.
   */
  toString(): string {
    return this.name ?? '<null>';
  }
}
