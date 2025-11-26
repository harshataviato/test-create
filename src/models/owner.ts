/**
 * @module models/owner
 * @description Defines the Owner interface, representing an owner of pets
 * in the PetClinic application. It extends the Person interface and
 * includes additional contact information and a collection of pets.
 */

import { Person } from '@models/person';
import { Pet } from '@models/pet';
import { Visit } from '@models/visit';

/**
 * @interface Owner
 * @extends {Person}
 * @description Represents a simple JavaBean domain object for an owner.
 * An owner has personal details (first name, last name), contact information (address, city, telephone),
 * and a collection of pets they own.
 */
export interface Owner extends Person {
  /**
   * @property {string} address
   * @description The address of the owner. Must be non-blank.
   */
  address: string;

  /**
   * @property {string} city
   * @description The city where the owner resides. Must be non-blank.
   */
  city: string;

  /**
   * @property {string} telephone
   * @description The telephone number of the owner. Must be a 10-digit number.
   */
  telephone: string;

  /**
   * @property {Pet[]} pets
   * @description A list of pets owned by this owner.
   * Initialized as an empty array, new pets are added to it.
   */
  pets: Pet[];
}
