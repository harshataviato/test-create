/**
 * @module models/visit
 * @description Defines the Visit interface, representing a single visit
 * a pet makes to the PetClinic. It extends the BaseEntity interface and
 * includes details like the visit date and a description.
 */

import { BaseEntity } from '@models/baseEntity';

/**
 * @interface Visit
 * @extends {BaseEntity}
 * @description Represents a simple JavaBean domain object for a visit.
 * A visit has a date and a description of the visit.
 */
export interface Visit extends BaseEntity {
  /**
   * @property {Date} date
   * @description The date of the visit.
   * Defaults to the current date when a new instance is created.
   */
  date: Date;

  /**
   * @property {string} description
   * @description A description of the visit (e.g., "rabies shot", "neutered").
   * Must be non-blank.
   */
  description: string;

  /**
   * @property {number} petId
   * @description The ID of the pet associated with this visit.
   * This is a foreign key relationship to the Pet entity.
   */
  petId: number;
}
