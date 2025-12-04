import { Column } from 'typeorm';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { BaseEntity } from './base.entity';

/**
 * @module Common
 * @description
 * Extends `BaseEntity` by adding `firstName` and `lastName` properties.
 * This class serves as a base for domain objects representing a person.
 */
export abstract class Person extends BaseEntity {
  /**
   * The first name of the person.
   * Mapped to the 'first_name' column in the database.
   * It cannot be blank.
   */
  @Column({ name: 'first_name', length: 30 })
  @IsString()
  @IsNotEmpty({ message: 'First name cannot be blank' })
  @MaxLength(30)
  firstName: string;

  /**
   * The last name of the person.
   * Mapped to the 'last_name' column in the database.
   * It cannot be blank.
   */
  @Column({ name: 'last_name', length: 30 })
  @IsString()
  @IsNotEmpty({ message: 'Last name cannot be blank' })
  @MaxLength(30)
  lastName: string;
}
