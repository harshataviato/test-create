/**
 * @module models/vet/Specialty
 * @description Defines the Specialty entity, representing a veterinarian's specialization.
 *              Mimics Spring's `Specialty.java`.
 */

import { Entity } from 'typeorm';
import { NamedEntity } from '@models/NamedEntity';

/**
 * @class Specialty
 * @extends {NamedEntity}
 * @description Models a Vet's specialty (for example, dentistry).
 */
@Entity('specialties')
export class Specialty extends NamedEntity {
  // No additional properties beyond NamedEntity
  constructor(partial?: Partial<Specialty>) {
    super();
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
