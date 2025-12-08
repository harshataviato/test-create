/**
 * @module models/vet/specialty.entity
 * @description
 * Defines the `Specialty` entity, representing a veterinarian's area of expertise.
 * It extends `NamedEntity` to include a name property.
 */

import { Entity } from 'typeorm';
import { NamedEntity } from '../named.entity';

/**
 * Specialty entity represents a veterinarian's specific area of expertise.
 * Examples: Radiology, Surgery, Dentistry.
 * It extends `NamedEntity` to inherit the `id` and `name` properties.
 */
@Entity('specialties') // Table name for specialties
export class Specialty extends NamedEntity {
  // No additional properties are needed as it extends NamedEntity which already has 'id' and 'name'.
}
