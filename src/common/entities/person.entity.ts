import { Column } from 'typeorm';
import { IsNotEmpty, IsString } from 'class-validator';
import { BaseEntity } from './base.entity';

/**
 * Person is a simple JavaBean domain object representing a person.
 * It extends BaseEntity and adds `firstName` and `lastName` properties.
 * This class is intended to be a MappedSuperclass for other entities like Owner or Vet.
 */
export abstract class Person extends BaseEntity {
  /**
   * The first name of the person.
   * This field cannot be blank and must be a string.
   * @example "George"
   */
  @Column({ name: 'first_name', length: 30 })
  @IsString({ message: 'firstName.invalid' })
  @IsNotEmpty({ message: 'firstName.required' })
  firstName: string;

  /**
   * The last name of the person.
   * This field cannot be blank and must be a string.
   * @example "Franklin"
   */
  @Column({ name: 'last_name', length: 30 })
  @IsString({ message: 'lastName.invalid' })
  @IsNotEmpty({ message: 'lastName.required' })
  lastName: string;

  /**
   * Returns the first name of the person.
   * @returns The first name.
   */
  getFirstName(): string {
    return this.firstName;
  }

  /**
   * Sets the first name of the person.
   * @param firstName The first name to set.
   */
  setFirstName(firstName: string): void {
    this.firstName = firstName;
  }

  /**
   * Returns the last name of the person.
   * @returns The last name.
   */
  getLastName(): string {
    return this.lastName;
  }

  /**
   * Sets the last name of the person.
   * @param lastName The last name to set.
   */
  setLastName(lastName: string): void {
    this.lastName = lastName;
  }
}
