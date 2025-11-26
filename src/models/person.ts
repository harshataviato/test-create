/**
 * @module models/person
 * @description Defines the Person interface, a base interface for
 * domain objects representing a person in the PetClinic application.
 * It extends BaseEntity and includes common personal details like
 * first name and last name.
 */

import { BaseEntity } from '@models/baseEntity';

/**
 * @interface Person
 * @extends {BaseEntity}
 * @description Represents a simple JavaBean domain object for a person.
 * It includes basic personal identification properties like first name and last name.
 */
export interface Person extends BaseEntity {
  /**
   * @property {string} firstName
   * @description The first name of the person. Must be non-blank.
   */
  firstName: string;

  /**
   * @property {string} lastName
   * @description The last name of the person. Must be non-blank.
   */
  lastName: string;
}
