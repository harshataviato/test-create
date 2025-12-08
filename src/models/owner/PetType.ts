/**
 * @module models/owner/PetType
 * @description Defines the PetType entity, representing different types of pets.
 *              Mimics Spring's `PetType.java`.
 */

import { Entity } from 'typeorm';
import { NamedEntity } from '@models/NamedEntity';

/**
 * @class PetType
 * @extends {NamedEntity}
 * @description Represents the type of a pet (e.g., Cat, Dog, Hamster).
 */
@Entity('types')
export class PetType extends NamedEntity {
  // No additional properties beyond NamedEntity
  constructor(partial?: Partial<PetType>) {
    super();
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
