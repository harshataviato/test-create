/**
 * @module models/pet
 * @description Defines the Pet interface, representing an animal
 * owned by an owner in the PetClinic application. It extends the
 * NamedEntity interface and includes properties like birth date,
 * pet type, and a collection of visits.
 */

import { NamedEntity } from '@models/namedEntity';
import { PetType } from '@models/petType';
import { Visit } from '@models/visit';

/**
 * @interface Pet
 * @extends {NamedEntity}
 * @description Represents a simple business object for a pet.
 * A pet has a name, a birth date, a type (e.g., cat, dog),
 * and a collection of visits to the clinic.
 */
export interface Pet extends NamedEntity {
  /**
   * @property {Date} birthDate
   * @description The birth date of the pet.
   * Stored as a Date object.
   */
  birthDate: Date;

  /**
   * @property {PetType} type
   * @description The type of the pet (e.g., Cat, Dog, Hamster).
   * This is a reference to a PetType entity.
   */
  type: PetType;

  /**
   * @property {number} ownerId
   * @description The ID of the owner of this pet.
   * This is a foreign key relationship to the Owner entity.
   */
  ownerId: number;

  /**
   * @property {Visit[]} visits
   * @description A collection of visits made by this pet to the clinic.
   * Stored as an array of Visit objects, ordered by date.
   */
  visits: Visit[];
}
