/**
 * @module models/owner/pet-type.entity
 * @description
 * Defines the `PetType` entity, which represents categories of pets (e.g., cat, dog).
 * It extends `NamedEntity` to include a name property.
 */

import { Entity } from 'typeorm';
import { NamedEntity } from '../named.entity';

/**
 * PetType entity represents the type or species of a pet.
 * Examples: Cat, Dog, Hamster.
 * It extends `NamedEntity` to inherit the `id` and `name` properties.
 */
@Entity('types') // Table name for pet types
export class PetType extends NamedEntity {
  // No additional properties are needed as it extends NamedEntity which already has 'id' and 'name'.
}
