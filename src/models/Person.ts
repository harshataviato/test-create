/**
 * @module models/Person
 * @description Defines the base class for a person,
 *              extending `BaseEntity` with first and last name properties.
 *              Mimics Spring's `Person.java`.
 */

import { Column } from 'typeorm';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { BaseEntity } from './BaseEntity';

/**
 * @class Person
 * @extends {BaseEntity}
 * @description Simple JavaBean domain object representing a person.
 */
export abstract class Person extends BaseEntity {
  /**
   * @property {string} firstName
   * @description The first name of the person.
   * @decorator `@Column({ name: 'first_name', length: 30 })` - Maps to a 'first_name' column in the database with max length 30.
   * @decorator `@IsString()` - Ensures the property is a string.
   * @decorator `@IsNotEmpty({ message: 'required' })` - Ensures the first name is not blank.
   * @decorator `@MaxLength(30)` - Ensures the first name does not exceed 30 characters.
   */
  @Column({ name: 'first_name', length: 30 })
  @IsString()
  @IsNotEmpty({ message: 'required' })
  @MaxLength(30, { message: 'First name cannot be longer than 30 characters' })
  firstName: string;

  /**
   * @property {string} lastName
   * @description The last name of the person.
   * @decorator `@Column({ name: 'last_name', length: 30 })` - Maps to a 'last_name' column in the database with max length 30.
   * @decorator `@IsString()` - Ensures the property is a string.
   * @decorator `@IsNotEmpty({ message: 'required' })` - Ensures the last name is not blank.
   * @decorator `@MaxLength(30)` - Ensures the last name does not exceed 30 characters.
   */
  @Column({ name: 'last_name', length: 30 })
  @IsString()
  @IsNotEmpty({ message: 'required' })
  @MaxLength(30, { message: 'Last name cannot be longer than 30 characters' })
  lastName: string;
}
