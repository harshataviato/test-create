/**
 * @module models/person.entity
 * @description
 * Extends `BaseEntity` by adding `firstName` and `lastName` properties.
 * This is a common base class for entities representing people, like `Owner` and `Vet`.
 */

import { Column } from 'typeorm';
import { BaseEntity } from './base.entity';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * Person extends BaseEntity and adds 'firstName' and 'lastName' properties.
 * It includes validation constraints for both name fields.
 */
export abstract class Person extends BaseEntity {
  /**
   * The first name of the person.
   * - Must not be empty.
   * - Must be a string.
   * - Maximum length of 30 characters.
   */
  @Column({ name: 'first_name', length: 30 })
  @IsNotEmpty({ message: 'First name is required' })
  @IsString({ message: 'First name must be a string' })
  @MaxLength(30, { message: 'First name cannot be longer than 30 characters' })
  firstName?: string;

  /**
   * The last name of the person.
   * - Must not be empty.
   * - Must be a string.
   * - Maximum length of 30 characters.
   */
  @Column({ name: 'last_name', length: 30 })
  @IsNotEmpty({ message: 'Last name is required' })
  @IsString({ message: 'Last name must be a string' })
  @MaxLength(30, { message: 'Last name cannot be longer than 30 characters' })
  lastName?: string;
}
