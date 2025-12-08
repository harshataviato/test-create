/**
 * @module models/NamedEntity
 * @description Defines a base entity with a `name` property,
 *              extending the `BaseEntity` and mimicking Spring's `NamedEntity.java`.
 */

import { Column } from 'typeorm';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { BaseEntity } from './BaseEntity';

/**
 * @class NamedEntity
 * @extends {BaseEntity}
 * @description Simple domain object that adds a `name` property to `BaseEntity`.
 *              Used as a base class for objects needing these properties.
 */
export abstract class NamedEntity extends BaseEntity {
  /**
   * @property {string} name
   * @description The name of the entity.
   * @decorator `@Column({ name: 'name', length: 80 })` - Maps to a 'name' column in the database with max length 80.
   * @decorator `@IsString()` - Ensures the property is a string.
   * @decorator `@IsNotEmpty()` - Ensures the name is not empty.
   * @decorator `@MaxLength(80)` - Ensures the name does not exceed 80 characters.
   */
  @Column({ name: 'name', length: 80 })
  @IsString()
  @IsNotEmpty({ message: 'required' })
  @MaxLength(80, { message: 'Name cannot be longer than 80 characters' })
  name: string;

  /**
   * @method toString
   * @description Returns a string representation of the entity's name.
   * @returns {string} The name of the entity, or "<null>" if the name is not set.
   */
  toString(): string {
    return this.name || '<null>';
  }
}
